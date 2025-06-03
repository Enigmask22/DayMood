const { getDefaultConfig } = require("expo/metro-config");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// Bắt đầu với Expo default config
const defaultConfig = getDefaultConfig(__dirname);

// Áp dụng Sentry config lên Expo config
const config = getSentryExpoConfig(__dirname, defaultConfig);

// Polyfill Node.js core modules for React Native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // Core modules
  assert: require.resolve("assert/"),
  buffer: require.resolve("buffer/"),
  crypto: require.resolve("crypto-browserify"),
  events: require.resolve("events/"),
  http: require.resolve("stream-http"),
  https: require.resolve("stream-http"),
  os: require.resolve("os-browserify/browser"),
  path: require.resolve("path-browserify"),
  punycode: require.resolve("punycode/"),
  stream: require.resolve("stream-browserify"),
  string_decoder: require.resolve("string_decoder/"),
  timers: require.resolve("timers-browserify"),
  tty: require.resolve("tty-browserify"),
  url: require.resolve("url/"),
  util: require.resolve("util/"),
  vm: require.resolve("vm-browserify"),
  zlib: require.resolve("browserify-zlib"),
  net: require.resolve("./empty-module.js"),
  tls: require.resolve("./empty-module.js"),
  "ws/lib/websocket-server.js": require.resolve("./empty-module.js"),
  "ws/lib/stream.js": require.resolve("./empty-module.js"),
};

module.exports = config;
