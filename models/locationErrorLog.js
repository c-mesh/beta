var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LocationErrorLogSchema = new Schema({
    ip: {
        type: String,
    },
    deviceName: {
        type: String,
    },
    OS: {
        type: String
    },
    browser: {
        type: String
    },
    timestamp: {
        type: String
    }
});

var locationErrorLogs = mongoose.model("locationErrorLogs", LocationErrorLogSchema);
module.exports = locationErrorLogs;