const mongoose = require("mongoose");

const productFavouriteSchema = new mongoose.Schema({
    product_favourite_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true }
});

const ProductFavourite = mongoose.model("productFavourite", productFavouriteSchema);
module.exports = ProductFavourite;