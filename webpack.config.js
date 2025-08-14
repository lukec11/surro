/* eslint-disable no-undef */

module.exports = {
  // set entry
  entry: './src/index.ts',

  // set name
  name: 'surro-browser',

  // set mode (production)
  mode: 'production',

  // file resolutions
  resolve: {
    extensions: ['.ts'],
  },

  // use ts loaders
  module: {
    rules: [
      {
        test: /\.ts/,
        use: 'ts-loader',
        include: __dirname + '/src',
      },
    ],
  },

  // output bundles (location)
  output: {
    path: __dirname + '/dist/web',
    filename: 'surro.js',
    library: 'surro',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
};
