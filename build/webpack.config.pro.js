const BaseWebpackConfig = require('./webpack.config.base');
const Path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 真正起作用的 webpack 配置
module.exports = merge(BaseWebpackConfig, {
    mode: 'production',
    output: {
        path: Path.resolve('./dist'),
        filename: 'js/[name]_[chunkhash:10].js',
        chunkFilename: 'js/[name]_[chunkhash:10].js',
    },
    plugins: [
        new CleanWebpackPlugin(['./dist'], {
             root: Path.resolve(),
             verbose: true,
             dry: false
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name]_[hash:10].css',
            chunkFilename: 'css/[id]_[hash:10].css'
        })
    ]
    .concat(...(false ? [new BundleAnalyzerPlugin()] : []))
});
