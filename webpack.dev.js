const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    entry: {
        index: "./src/index.js",
        tutorial: "./src/tutorial/index.js",
        debugger: "./src/debugger/index.js",
        browserSupport: "./src/browser-support/index.js",
        "cookie-consent": './src/cookie-consent.js',
        "ccpa-modal": './src/ccpa-modal.js'
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/dist/js",
    },
});
