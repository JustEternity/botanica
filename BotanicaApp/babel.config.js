module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... your other plugins, if any
      ['@babel/plugin-transform-private-methods', { loose: true }]
    ],
  };
};