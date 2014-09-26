/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ReactInput
 */

"use strict";

var DOMPropertyOperations = require('DOMPropertyOperations');
var LinkedValueUtils = require('LinkedValueUtils');
var ReactCompositeComponent = require('ReactCompositeComponent');
var ReactDescriptor = require('ReactDescriptor');
var ReactDOMInput = require('ReactDOMInput');
var ReactMount = require('ReactMount');
var ReactUpdates = require('ReactUpdates');

var merge = require('merge');

// Store a reference to the <input> `ReactDOMComponent`. TODO: use string
var input = ReactDescriptor.createFactory(ReactDOMInput.type);

var instancesByReactID = {};

function forceUpdateIfMounted() {
  /*jshint validthis:true */
  if (this.isMounted()) {
    this.forceUpdate();
  }
}

/**
 * Implements an <input> native component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
var ReactInput = ReactCompositeComponent.createClass({
  displayName: 'ReactInput',

  mixins: [LinkedValueUtils.Mixin],

  getInitialState: function() {
    var checked = LinkedValueUtils.getChecked(this);
    var value = LinkedValueUtils.getValue(this);
    return {
      // We don't have to save the initial value, but do it to play nice if
      // `ReactDOMInput` decides to use `shouldComponentUpdate`.
      initialChecked: checked != null ? checked : this.props.defaultChecked,
      initialValue: value != null ? value : this.props.defaultValue
    };
  },

  render: function() {
    // Clone `this.props` so we don't mutate the input.
    var props = merge(this.props);

    props.initialChecked = this.state.initialChecked;
    props.initialValue = this.state.initialValue;
    props.onChange = this._handleChange;

    return input(props, props.children);
  },

  componentDidMount: function() {
    var id = ReactMount.getID(this.getDOMNode());
    instancesByReactID[id] = this;
  },

  componentWillUnmount: function() {
    var rootNode = this.getDOMNode();
    var id = ReactMount.getID(rootNode);
    delete instancesByReactID[id];
  },

  componentDidUpdate: function(prevProps, prevState, prevContext) {
    var rootNode = this.getDOMNode();

    var checked = LinkedValueUtils.getValue(this);
    if (checked != null) {
      DOMPropertyOperations.setValueForProperty(rootNode, 'checked', checked);
    }

    var value = LinkedValueUtils.getValue(this);
    if (value != null) {
      DOMPropertyOperations.setValueForProperty(rootNode, 'value', value);
    }
  },

  _handleChange: function(event) {
    var returnValue;
    var onChange = LinkedValueUtils.getOnChange(this);
    if (onChange) {
      returnValue = onChange.call(this, event);
    }
    // Here we use setImmediate to wait until all updates have propagated, which
    // is important when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    ReactUpdates.setImmediate(forceUpdateIfMounted, this);

    var name = this.props.name;
    if (this.props.type === 'radio' && name != null) {
      var rootNode = this.getDOMNode();
      var queryRoot = rootNode;

      while (queryRoot.parentNode) {
        queryRoot = queryRoot.parentNode;
      }

      // If `rootNode.form` was non-null, then we could try `form.elements`,
      // but that sometimes behaves strangely in IE8. We could also try using
      // `form.getElementsByName`, but that will only return direct children
      // and won't include inputs that use the HTML5 `form=` attribute. Since
      // the input might not even be in a form, let's just use the global
      // `querySelectorAll` to ensure we don't miss anything.
      var group = queryRoot.querySelectorAll(
        'input[name=' + JSON.stringify('' + name) + '][type="radio"]');

      for (var i = 0, groupLen = group.length; i < groupLen; i++) {
        var otherNode = group[i];
        if (otherNode === rootNode ||
            otherNode.form !== rootNode.form) {
          continue;
        }
        var otherID = ReactMount.getID(otherNode);
        invariant(
          otherID,
          'ReactDOMInput: Mixing React and non-React radio inputs with the ' +
          'same `name` is not supported.'
        );
        var otherInstance = instancesByReactID[otherID];
        invariant(
          otherInstance,
          'ReactDOMInput: Unknown radio button ID %s.',
          otherID
        );
        // If this is a controlled radio button group, forcing the input that
        // was previously checked to update will cause it to be come re-checked
        // as appropriate.
        ReactUpdates.setImmediate(forceUpdateIfMounted, otherInstance);
      }
    }

    return returnValue;
  }

});

module.exports = ReactInput;
