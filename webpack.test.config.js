const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const fs = require('fs');
const path = require('path');

fs.open('./src/config/env.js', 'w', function(err, fd) {
    const buf = 'export default "test";';
    fs.write(fd, buf, 0, buf.length, 0, function(err, written, buffer) {});
});

module.exports = merge(webpackBaseConfig, {
    output: {
		path: path.join(__dirname, './test/dist'),
        publicPath: '/dist/',
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].[hash].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.[hash].js'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"test"'
            }
        }),
        //new webpack.optimize.UglifyJsPlugin({
        //    compress: {
        //       warnings: false
        //    }
        //}),
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './src/template/index.ejs',
			favicon: './src/assets/images/favicon.ico',
            inject: false
        })
    ]
});