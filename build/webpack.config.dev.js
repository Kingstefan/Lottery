const Path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BaseWebpackConfig = require('./webpack.config.base');

// 真正起作用的 webpack 配置
module.exports = merge(BaseWebpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    output: {
        path: Path.resolve('./dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(['dist/'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css'
        })
    ]
});
