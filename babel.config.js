module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      // plugins: ['react-native-paper/babel'],
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          assets: './assets',
          components: './components',
          modules: './modules',
          reducers: './reducers',
          screens: './screens',
        },
      },
    ],
  ],
};
