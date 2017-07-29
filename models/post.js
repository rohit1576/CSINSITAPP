var mongoose    = require('mongoose');


var postSchema = new mongoose.Schema({
    message: String,
    created: String,
    likecount: Number,
    sharecount: Number
		
});




module.exports = mongoose.model("post",postSchema);
