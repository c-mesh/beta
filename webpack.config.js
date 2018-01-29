var webpack = require('webpack');
module.exports = {
    entry: "./app/app.jsx",
    output: {
        filename: "public/bundle.js",
        publicPath: "/"
    },
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
    devtool: "eval-source-map",
};
