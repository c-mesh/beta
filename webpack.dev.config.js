import { SourceMap } from '../../.cache/typescript/2.6/node_modules/@types/uglify-js';

var webpack = require('webpack');
module.exports = {
    entry: "./app/app.jsx",
    output: {
        filename: "public/bundle.js",
        publicPath: "/"
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
            warnings: false
            },
            
            SourceMap: true
        }),
        new webpack.optimize.AggressiveMergingPlugin()
    ],
    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            include: /app/,
            loader: "babel-loader",
            query: {
                presets: ["react", "es2015"]
            }
        }, {
              test: /\.css$/,
              loader: ['style-loader', 'css-loader']
        }]
    },
    devtool: "source-map",
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/
    }
};
