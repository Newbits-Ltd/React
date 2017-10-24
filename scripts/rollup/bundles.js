'use strict';

const bundleTypes = {
  UMD_DEV: 'UMD_DEV',
  UMD_PROD: 'UMD_PROD',
  NODE_DEV: 'NODE_DEV',
  NODE_PROD: 'NODE_PROD',
  FB_DEV: 'FB_DEV',
  FB_PROD: 'FB_PROD',
  RN_DEV: 'RN_DEV',
  RN_PROD: 'RN_PROD',
};

const UMD_DEV = bundleTypes.UMD_DEV;
const UMD_PROD = bundleTypes.UMD_PROD;
const NODE_DEV = bundleTypes.NODE_DEV;
const NODE_PROD = bundleTypes.NODE_PROD;
const FB_DEV = bundleTypes.FB_DEV;
const FB_PROD = bundleTypes.FB_PROD;
const RN_DEV = bundleTypes.RN_DEV;
const RN_PROD = bundleTypes.RN_PROD;

const moduleTypes = {
  ISOMORPHIC: 'ISOMORPHIC',
  RENDERER: 'RENDERER',
  RENDERER_UTILS: 'RENDERER_UTILS',
  RECONCILER: 'RECONCILER',
};

// React
const ISOMORPHIC = moduleTypes.ISOMORPHIC;
// Individual renderers. They bundle the reconciler. (e.g. ReactDOM)
const RENDERER = moduleTypes.RENDERER;
// Helper packages that access specific renderer's internals. (e.g. TestUtils)
const RENDERER_UTILS = moduleTypes.RENDERER_UTILS;
// Standalone reconciler for third-party renderers.
const RECONCILER = moduleTypes.RECONCILER;

const bundles = [
  /******* Isomorphic *******/
  {
    label: 'core',
    bundleTypes: [UMD_DEV, UMD_PROD, NODE_DEV, NODE_PROD, FB_DEV, FB_PROD],
    moduleType: ISOMORPHIC,
    entry: 'react',
    global: 'React',
    externals: [],
  },

  /******* React DOM *******/
  {
    label: 'dom-fiber',
    bundleTypes: [UMD_DEV, UMD_PROD, NODE_DEV, NODE_PROD, FB_DEV, FB_PROD],
    moduleType: RENDERER,
    entry: 'react-dom',
    global: 'ReactDOM',
    externals: ['react'],
  },

  //******* Test Utils *******/
  {
    label: 'test-utils',
    moduleType: RENDERER_UTILS,
    bundleTypes: [FB_DEV, NODE_DEV, NODE_PROD],
    entry: 'react-dom/test-utils',
    global: 'ReactTestUtils',
    externals: ['react', 'react-dom'],
  },

  /* React DOM internals required for react-native-web (e.g., to shim native events from react-dom) */
  {
    label: 'dom-unstable-native-dependencies',
    bundleTypes: [UMD_DEV, UMD_PROD, NODE_DEV, NODE_PROD, FB_DEV, FB_PROD],
    moduleType: RENDERER_UTILS,
    entry: 'react-dom/unstable-native-dependencies',
    global: 'ReactDOMUnstableNativeDependencies',
    externals: ['react', 'react-dom'],
  },

  /******* React DOM Server *******/
  {
    label: 'dom-server-browser',
    bundleTypes: [UMD_DEV, UMD_PROD, NODE_DEV, NODE_PROD, FB_DEV, FB_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/server.browser',
    global: 'ReactDOMServer',
    externals: ['react'],
  },

  {
    label: 'dom-server-node',
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'react-dom/server',
    output: 'react-dom/server.node',
    externals: ['react', 'stream'],
  },

  /******* React ART *******/
  {
    label: 'art-fiber',
    bundleTypes: [UMD_DEV, UMD_PROD, NODE_DEV, NODE_PROD, FB_DEV, FB_PROD],
    moduleType: RENDERER,
    entry: 'react-art',
    global: 'ReactART',
    externals: ['react'],
    babel: opts =>
      Object.assign({}, opts, {
        // Include JSX
        presets: opts.presets.concat([require.resolve('babel-preset-react')]),
      }),
  },

  /******* React Native *******/
  {
    label: 'native-fiber',
    bundleTypes: [RN_DEV, RN_PROD],
    moduleType: RENDERER,
    entry: 'react-native-renderer',
    global: 'ReactNativeRenderer',
    externals: [
      'ExceptionsManager',
      'InitializeCore',
      'Platform',
      'RCTEventEmitter',
      'TextInputState',
      'UIManager',
      'View',
      'deepDiffer',
      'deepFreezeAndThrowOnMutationInDev',
      'flattenStyle',
    ],
  },

  /******* React Native RT *******/
  {
    label: 'native-rt-fiber',
    bundleTypes: [RN_DEV, RN_PROD],
    moduleType: RENDERER,
    entry: 'react-rt-renderer',
    global: 'ReactRTRenderer',
    externals: [
      'ExceptionsManager',
      'InitializeCore',
      'Platform',
      'BatchedBridge',
      'RTManager',
    ],
  },

  /******* React Native CS *******/
  {
    label: 'native-cs-fiber',
    bundleTypes: [RN_DEV, RN_PROD],
    moduleType: RENDERER,
    entry: 'react-cs-renderer',
    global: 'ReactCSRenderer',
    externals: [],
    featureFlags: 'react-cs-renderer/src/ReactNativeCSFeatureFlags',
  },

  /******* React Test Renderer *******/
  {
    label: 'test-fiber',
    bundleTypes: [FB_DEV, NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'react-test-renderer',
    global: 'ReactTestRenderer',
    externals: ['react'],
  },

  {
    label: 'shallow-fiber',
    bundleTypes: [FB_DEV, NODE_DEV, NODE_PROD],
    moduleType: RENDERER,
    entry: 'react-test-renderer/shallow',
    global: 'ReactShallowRenderer',
    externals: ['react'],
  },

  /******* React Noop Renderer (used only for fixtures/fiber-debugger) *******/
  {
    label: 'noop-fiber',
    bundleTypes: [NODE_DEV],
    moduleType: RENDERER,
    entry: 'react-noop-renderer',
    global: 'ReactNoopRenderer',
    externals: ['react', 'jest-matchers'],
  },

  /******* React Reconciler *******/
  {
    label: 'react-reconciler',
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: RECONCILER,
    entry: 'react-reconciler',
    global: 'ReactReconciler',
    externals: ['react'],
  },
];

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles);

module.exports = {
  bundleTypes,
  moduleTypes,
  bundles,
};
