var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LocationLogUserSchema = new Schema({
    ip: {
        type: String,
    },
    firstVisit0n: {
        type: String,
    },
    resolvedOn: {
        type: String
    },
    status: {
        type: Number
    }
});

LocationLogUserSchema.static('findByIp', function(ip, callback){
    return this.find({ ip: ip }, callback);
});

var LocationLogUser = mongoose.model("LocationLogUser", LocationLogUserSchema);
module.exports = LocationLogUser;