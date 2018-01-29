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
              loader: ['style-loader', 'css-loader']
        }]
    },
    devtool: "eval-source-map",
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/
    }
};
