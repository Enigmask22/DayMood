// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Polyfill Node.js core modules for React Native
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  // Core modules
  assert: require.resolve('assert/'),
  buffer: require.resolve('buffer/'),
  crypto: require.resolve('crypto-browserify'),
  events: require.resolve('events/'),
  http: require.resolve('stream-http'),
  https: require.resolve('stream-http'),
  os: require.resolve('os-browserify/browser'),
  path: require.resolve('path-browserify'),
  punycode: require.resolve('punycode/'), // Often a dep of 'url'
  stream: require.resolve('stream-browserify'),
  string_decoder: require.resolve('string_decoder/'),
  timers: require.resolve('timers-browserify'),
  tty: require.resolve('tty-browserify'),
  url: require.resolve('url/'), // Polyfills the 'url' module. react-native-url-polyfill handles global URL
  util: require.resolve('util/'),
  vm: require.resolve('vm-browserify'),
  zlib: require.resolve('browserify-zlib'),
  net: require.resolve('./empty-module.js'), // Add this line to mock 'net'
  tls: require.resolve('./empty-module.js'), // Add this line to mock 'tls'
  'ws/lib/websocket-server.js': require.resolve('./empty-module.js'), // Create an empty JS file
  'ws/lib/stream.js': require.resolve('./empty-module.js'), // if 'stream.js' from ws also causes issues and stream-browserify doesn't cut it for its specific use.

  // Some modules are best left as false if they are server-only and not practically polyfillable
  // or if their functionality is not expected in a client.
  // 'fs': false, // If you encounter 'fs' errors from server-side code, you might disable it or use a mock.
  // 'child_process': false,
  // 'dgram': false,
};

// You might also need to ensure that certain packages are transformed if they use syntax not understood by Metro.
// defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
// defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
// defaultConfig.resolver.sourceExts.push('svg');

module.exports = defaultConfig;