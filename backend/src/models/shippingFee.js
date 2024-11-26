const mongoose = require("mongoose");
const shippingFeeSchema = new mongoose.Schema({
    shipping_fee_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    city_id: { type: mongoose.Schema.Types.ObjectId, ref: "city", required: true },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    shipping_cost: { type: Number, required: true }
});
const ShippingFee = mongoose.model("shippingFee", shippingFeeSchema);
module.exports = ShippingFee;
