const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    order_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    order_date: { type: Date, default: Date.now },
    order_status: { 
        type: String, 
        enum: ["pending","waiting", "accept", "reject"],
        default: "pending"
    },
    payment_method_id: { type: mongoose.Schema.Types.ObjectId, ref: "payment_method" },
    order_approval_date: Date,
    shipping_fee_id: { type: mongoose.Schema.Types.ObjectId, ref: "shipping_fee" },
    total_amount: { type: Number, required: true },
    rejection_reason: { type: String, default: "" } 
});

const Order = mongoose.model("order", orderSchema);
module.exports = Order;