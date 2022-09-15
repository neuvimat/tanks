// const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const path = require('path');
// const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        js:  './src/js/main.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/')
    },
    plugins: [
        // new CleanPlugin(['public/javascripts/*']),
    ],
    mode: 'none',
    devtool: "inline-source-map",
};