var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    firstName:{
        type: String
    },
    lastName:{
        type: String
    },
    photo: {
        type: String
    },
    job: {
        type: String
    },
    linkedinURL: {
        type: String,
        unique: true,
    },
    messagesSent: {
        type: Number,
        default: 0
    },
    linkedinClickd: {
        type: Number,
        default: 0
    },
    meshCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meshes"
    }],
    acceptedTermsAndConditions: {
        type: Number,
        default: 0
    },
    acceptedTermsAndConditionsOn: {
        type: Number,
        default: 0
    }
});

var User = mongoose.model("User", UserSchema);
module.exports = User;