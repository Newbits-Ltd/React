/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNativeFiber
 * @flow
 */

'use strict';

const ReactFiberErrorLogger = require('ReactFiberErrorLogger');
const ReactGenericBatching = require('ReactGenericBatching');
const ReactNativeFiberErrorDialog = require('ReactNativeFiberErrorDialog');
const ReactNativeInjection = require('ReactNativeInjection');
const ReactPortal = require('ReactPortal');
const ReactNativeComponentTree = require('ReactNativeComponentTree');
const ReactNativeFiberRenderer = require('ReactNativeFiberRenderer');
const ReactVersion = require('ReactVersion');
const UIManager = require('UIManager');

const findNodeHandle = require('findNodeHandle');

const {injectInternals} = require('ReactFiberDevToolsHook');

import type {Element} from 'React';
import type {Fiber} from 'ReactFiber';
import type {ReactNodeList} from 'ReactTypes';

ReactNativeInjection.inject();

ReactGenericBatching.injection.injectFiberBatchedUpdates(
  ReactNativeFiberRenderer.batchedUpdates,
);

const roots = new Map();

findNodeHandle.injection.injectFindNode((fiber: Fiber) =>
  ReactNativeFiberRenderer.findHostInstance(fiber),
);
findNodeHandle.injection.injectFindRootNodeID(instance => instance);

// Intercept lifecycle errors and ensure they are shown with the correct stack
// trace within the native redbox component.
ReactFiberErrorLogger.injection.injectDialog(
  ReactNativeFiberErrorDialog.showDialog,
);

const ReactNative = {
  // External users of findNodeHandle() expect the host tag number return type.
  // The injected findNodeHandle() strategy returns the instance wrapper though.
  // See NativeMethodsMixin#setNativeProps for more info on why this is done.
  findNodeHandle(componentOrHandle: any): ?number {
    const instance: any = findNodeHandle(componentOrHandle);
    if (instance == null || typeof instance === 'number') {
      return instance;
    }
    return instance._nativeTag;
  },

  render(element: Element<any>, containerTag: any, callback: ?Function) {
    let root = roots.get(containerTag);

    if (!root) {
      // TODO (bvaughn): If we decide to keep the wrapper component,
      // We could create a wrapper for containerTag as well to reduce special casing.
      root = ReactNativeFiberRenderer.createContainer(containerTag);
      roots.set(containerTag, root);
    }
    ReactNativeFiberRenderer.updateContainer(element, root, null, callback);

    return ReactNativeFiberRenderer.getPublicRootInstance(root);
  },

  unmountComponentAtNode(containerTag: number) {
    const root = roots.get(containerTag);
    if (root) {
      // TODO: Is it safe to reset this now or should I wait since this unmount could be deferred?
      ReactNativeFiberRenderer.updateContainer(null, root, null, () => {
        roots.delete(containerTag);
      });
    }
  },

  unmountComponentAtNodeAndRemoveContainer(containerTag: number) {
    ReactNative.unmountComponentAtNode(containerTag);

    // Call back into native to remove all of the subviews from this container
    UIManager.removeRootView(containerTag);
  },

  unstable_createPortal(
    children: ReactNodeList,
    containerTag: number,
    key: ?string = null,
  ) {
    return ReactPortal.createPortal(children, containerTag, null, key);
  },

  unstable_batchedUpdates: ReactGenericBatching.batchedUpdates,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    // Used as a mixin in many createClass-based components
//    NativeMethodsMixin: require('NativeMethodsMixin'),

    // Used by react-native-github/Libraries/ components
    PooledClass: require('PooledClass'), // Components/Touchable
    ReactDebugTool: require('ReactDebugTool'), // RCTRenderingPerf, Systrace
    ReactGlobalSharedState: require('ReactGlobalSharedState'), // Systrace
    ReactNativeComponentTree: require('ReactNativeComponentTree'), // InspectorUtils, ScrollResponder
    ReactNativePropRegistry: require('ReactNativePropRegistry'), // flattenStyle, Stylesheet
    ReactPerf: require('ReactPerf'), // ReactPerfStallHandler, RCTRenderingPerf
    TouchHistoryMath: require('TouchHistoryMath'), // PanResponder
//    createReactNativeComponentClass: require('createReactNativeComponentClass'), // eg Text
//    takeSnapshot: require('takeSnapshot'), // react-native-implementation
  },
};

if (typeof injectInternals === 'function') {
  injectInternals({
    findFiberByHostInstance: ReactNativeComponentTree.getClosestInstanceFromNode,
    findHostInstanceByFiber: ReactNativeFiberRenderer.findHostInstance,
    // This is an enum because we may add more (e.g. profiler build)
    bundleType: __DEV__ ? 1 : 0,
    version: ReactVersion,
  });
}

module.exports = ReactNative;
