const mongoose = require("mongoose");
const blogPostSchema = new mongoose.Schema({
    blog_post_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    blog_title: { type: String, required: true },
    blog_image: { type: String },
    blog_content: { type: String, required: true, default: "",minlength: 10, maxlength: 10000 },
    review_date: { type: Date, default: Date.now },
});

const BlogPost = mongoose.model("blogPost", blogPostSchema);
module.exports = BlogPost;