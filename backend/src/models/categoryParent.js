const mongoose = require("mongoose");

const categoryParentSchema = new mongoose.Schema({
    category_parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    category_parent_name: { type: String, required: true }
});

const CategoryParent = mongoose.model("categoryParent", categoryParentSchema);

module.exports = CategoryParent;
