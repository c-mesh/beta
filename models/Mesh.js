var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MeshSchema = new Schema({
    eventId:{
        type: String
    },
    meshName: {
        type: String,
        required: true
    },
    meshCreatedAtTime: {
        type: String,
    },
    meshStartTime: {
        type: String
    },
    meshStartTimeMilliSec: {
        type: Number
    },
    meshEndTime: {
        type: String
    },
    meshEndTimeMilliSec: {
        type: Number
    },
    meshCoordinate: {
        lat: Number,
        lng: Number
    },
    meshLocationAddress: {
        type: String
    },
    meshCreationLocationCoordinates: {
        lat: Number,
        lng: Number
    },
    meshCreatedCoordinate: {
        lat: Number,
        lng: Number
    },
    peakParticipantNumber: {
        type: Number,
        default: 0
    },
    chat: [{
        userID: String,
        message: String
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    meshCreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
    }
});

var Mesh = mongoose.model("Mesh", MeshSchema);
module.exports = Mesh;