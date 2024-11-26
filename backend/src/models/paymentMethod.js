const mongoose = require("mongoose");
const paymentMethodSchema = new mongoose.Schema({
    payment_method_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    method_name: { type: String, required: true }
});
const PaymentMethod = mongoose.model("paymentMethod", paymentMethodSchema);
module.exports = PaymentMethod;