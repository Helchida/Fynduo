module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@/types': './types'
          }
        }
      ],
      // CE PLUGIN EST OBLIGATOIRE POUR LE DRAG N DROP
      'react-native-reanimated/plugin', 
    ],
  };
};