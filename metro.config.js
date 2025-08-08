const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// mock-server 폴더를 번들에서 제외
config.resolver.blockList = [
  /mock-server\/.*/,
];

module.exports = config;
