const Path = require('path')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BaseConfig = require('./webpack.config.base')
const utils = require('./utils')

module.exports = merge(BaseConfig, {
    mode: 'development',
    output: {
        path: Path.resolve(__dirname, '../dist/assets'),
        publicPath: `http://localhost:8888/assets`,
        filename: '[name].js',
        chunkFilename: '[id].js',
        jsonpFunction: 'head_footer'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new CleanWebpackPlugin(Path.resolve(__dirname, '../dist/assets'), {
            allowExternal: true,
            verbose: true,
            dry: false
        })
    ],
    devServer: {
        contentBase: Path.join(__dirname, '../dist'),
        compress: true,
        port: 8888,
        index: 'index.html',
        proxy: {
            // '/v1/cms/page': 'http://csc.localhost:80'
            // http://csc.localhost/v1/cms/page?block=page/html_topmenu&path=page/html/topmenu.phtml
        }
    }
})
