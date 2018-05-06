var webpack = require('webpack');
module.exports = {
    entry: "./app/app.jsx",
    output: {
        filename: "public/bundle.js",
        publicPath: "/"
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
            'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
            warnings: false
            }
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
              include: /node_modules/,
              loader: ['style-loader', 'css-loader']
        }]
    },
    devtool: "source-map",
};
