const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String },
    review_date: { type: Date, default: Date.now }
});

const Review = mongoose.model("review", reviewSchema);
module.exports = Review;