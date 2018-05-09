var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LocationErrorLogSchema = new Schema({
    ip: {
        type: String,
    },
    deviceName: {
        type: String,
        required: true
    },
    OS: {
        type: String,
        required: true
    },
    browser: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    }
});

var locationErrorLogs = mongoose.model("locationErrorLogs", LocationErrorLogSchema);
module.exports = locationErrorLogs;