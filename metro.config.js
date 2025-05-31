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

};

module.exports = defaultConfig;