const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        main: ['babel-polyfill','./src/main'],
        vendors: './src/vendors'
    },
    output: {
        path: path.join(__dirname, './dist'),
    },
    module: {
        rules: [
            {
                test: /.vue$/,
                use: [{
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            less: ExtractTextPlugin.extract({
                                use: ['css-loader?minimize', 'less-loader'],
                                fallback: 'vue-style-loader'
                            }),
                            css: ExtractTextPlugin.extract({
                                use: ['css-loader', 'less-loader'],
                                fallback: 'vue-style-loader'
                            }),
                            scss: ['vue-style-loader', 'css-loader','sass-loader',{
                                loader: 'sass-resources-loader',
                                options: {
                                    resources:  path.resolve(__dirname, './src/assets/index.scss'),
                                },
                            }]
                            // scss: ExtractTextPlugin.extract({
                            //     use: ['css-loader', 'postcss-loader', 'sass-loader',{
                            //         loader: 'sass-resources-loader',
                            //         options: {
                            //             resources:  path.resolve(__dirname, './src/assets/index.scss'),
                            //         },
                            //     }],
                            //     fallback: 'vue-style-loader'
                            // }),
                        }
                    }
                },
                    {
                        loader: 'iview-loader',
                        options: {
                            prefix: false
                        }
                    }
                ]
            },
            {
                test: /iview\/.*?js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader?minimize'],
                    fallback: 'style-loader'
                })
            },

            {
                test: /\.sass/,
                use: ExtractTextPlugin.extract({
                    use: [ 'sass-loader'],
                    fallback: 'style-loader'
                })
            },

            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=1024'
            },
            {
                test: /\.(html|tpl)$/,
                loader: 'html-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue': 'vue/dist/vue.esm.js'
        }
    }
};