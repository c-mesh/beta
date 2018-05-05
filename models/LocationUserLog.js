var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LocationLogUserSchema = new Schema({
    ip: {
        type: String,
    },
    firstVisitOn: {
        type: String,
    },
    resolvedOn: {
        type: String
    },
    status: {
        type: Number
    }
});

var LocationLogUser = mongoose.model("LocationLogUser", LocationLogUserSchema);
module.exports = LocationLogUser;