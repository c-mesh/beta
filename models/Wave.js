var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WaveSchema = new Schema({
    wave_who: {
        type: String,
        required: true
    },
    wave_to: {
        type: String,
        required: true
    },
});

WaveSchema.index({ wave_who:1, wave_to:1 }, { unique: true });

var Wave = mongoose.model("Wave", WaveSchema);
module.exports = Wave;
