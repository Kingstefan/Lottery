const Path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
    entry: {
        main: '../src/main.js',
        mainWap: '../src/mainWap.js'
    },
    context: Path.resolve('./src'),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: (loader) => [
                                require('autoprefixer')(),
                                require('cssnano')({
                                    zindex: false
                                })
                            ]
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ['./common/style']
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 4096,
                            name: '../[path][name]_[hash:10].[ext]',
                            fallback: 'file-loader'
                        }
                    }
                ]
            },
            {
                test: require.resolve('jquery'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'jQuery'
                    },
                    {
                        loader: 'expose-loader',
                        options: '$'
                    }
                ]
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader'
            }
        ]
    },
    plugins: [
        new Webpack.DefinePlugin({
            __DEV__: process.env.NODE_ENV === 'dev'
        }),
        // new Webpack.ProvidePlugin({
        //     $: 'jquery',
        //     jQuery: 'jquery',
        //     'window.$': 'jquery',
        //     'window.jQuery': 'jquery'
        // }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './index.html',
            inject: true,
            chunks: ['main']
        }),
        new HtmlWebpackPlugin({
            filename: 'index-m.html',
            template: './index-m.html',
            inject: true,
            chunks: ['mainWap']
        }),
        // new CopyWebpackPlugin([ //支持输入一个数组
        //     {
        //         from: Path.resolve('./src/datas'), //将src/assets下的文件
        //         to: Path.resolve('./dist/datas') // 复制到publiv
        //     }
        // ])
    ],
    resolve: {
        modules: [
            Path.resolve('node_modules'),
        ],
        extensions: ['.js', '.scss'],
        alias: {
            '@lib': Path.resolve('./common/lib'),
            '@comp': Path.resolve('./common/components')
        }
    }
}
