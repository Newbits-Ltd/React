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
 * @providesModule SyntheticPointerEvent
 * @typechecks static-only
 */

"use strict";

var SyntheticMouseEvent = require('SyntheticMouseEvent');

/**
 * @interface PointerEvent
 * @see http://www.w3.org/TR/pointerevents/
 */
var PointerEventInterface = {
  pointerId: null,
  width: null,
  height: null,
  pressure: null,
  tiltX: null,
  tiltY: null,
  pointerType: null,
  isPrimary: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticPointerEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticPointerEvent, PointerEventInterface);

module.exports = SyntheticPointerEvent;
