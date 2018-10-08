/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const addDefault = require('@babel/helper-module-imports').addDefault;

module.exports = function autoImporter(babel) {
  function getAssignIdent(path, state) {
    if (state.id) {
      return state.id;
    }
    state.id = addDefault(path, 'object-assign', {nameHint: 'assign'});
    return state.id;
  }

  return {
    pre: function() {
      // map from module to generated identifier
      this.id = null;
    },

    visitor: {
      CallExpression: function(path) {
        if (path.get('callee').matchesPattern('Object.assign')) {
          // generate identifier and require if it hasn't been already
          const id = getAssignIdent(path, this);
          path.node.callee = id;
        }
      },

      MemberExpression: function(path) {
        if (path.matchesPattern('Object.assign')) {
          const id = getAssignIdent(path, this);
          path.replaceWith(id);
        }
      },
    },
  };
};
