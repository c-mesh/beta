var webpack = require('webpack');
module.exports = {
    entry: "./app/app.jsx",
    output: {
        filename: "public/bundle.js",
        publicPath: "/"
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
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
        new webpack.optimize.AggressiveMergingPlugin(),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
          })
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
