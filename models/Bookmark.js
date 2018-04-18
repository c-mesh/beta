var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BookmarkSchema= new Schema({
    bookmark_owner: {
        type: String,
        required: true,
        unique: true,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
});

BookmarkSchema.index({ bookmark_owner:1, }, { unique: true });
var Bookmark = mongoose.model("Bookmark", BookmarkSchema);

module.exports = Bookmark;
