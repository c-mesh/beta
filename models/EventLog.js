var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EventLogSchema = new Schema({
    userId: {
        type: String,
    },
    meshId: {
        type: String,
    },
    type: {
        type: String
    },
    timestamp: {
        type: String
    },
    profilesViewed: {
        type: Array
    }
});

var EventLog = mongoose.model("eventLogs", EventLogSchema);
module.exports = EventLog;