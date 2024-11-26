const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
    promotion_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    promotion_name: { type: String, required: true },
    promotion_description: { type: String },
    // promotion_product_attach: { type: String },
    promotion_value: { type: Number, required: true },
    promotion_start_date: { type: Date, required: true },
    promotion_end_date: { type: Date, required: true }
});

const Promotion = mongoose.model("promotion", promotionSchema);
module.exports = Promotion;