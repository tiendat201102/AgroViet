const mongoose = require("mongoose");
const orderDetailSchema = new mongoose.Schema({
    order_detail_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "order", required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    product_quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    // san_pham_tang_kem: String
});

const OrderDetail = mongoose.model("orderDe", orderDetailSchema);
module.exports = OrderDetail;