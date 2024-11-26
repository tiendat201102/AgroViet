const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    product_name: { type: String, required: true },
    product_price: { type: Number, required: true },
    product_image: { type: String },
    product_category_parent: { type: mongoose.Schema.Types.ObjectId, ref: "categoryParent", required: true },
    product_category: { type: mongoose.Schema.Types.ObjectId, ref: "categoryChild", required: true },
    product_description: { type: String },
    product_inventory: { type: Number, required: true },
    product_unit: { type: String }, 
    product_harvest_date: { type: Date },
    product_expired: { type: Date },
    form_of_cultivation: { type: mongoose.Schema.Types.ObjectId, ref: "cultivation", required: true },
    feature: { type: mongoose.Schema.Types.ObjectId, ref: "feature", required: true },
    is_rescue: { type: Boolean, default: false }, 
    rescue_start_date: { type: Date },
    rescue_end_date: { type: Date },
    is_hidden: { type: Boolean, default: false } 
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("product", productSchema);

module.exports = Product;
