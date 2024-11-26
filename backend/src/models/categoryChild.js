const mongoose = require("mongoose");

const categoryChildSchema = new mongoose.Schema({
    category_child_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    category_parent_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "categoryParent",
        required: true 
    },
    category_child_name: { type: String, required: true },
});

const CategoryChild = mongoose.model("categoryChild", categoryChildSchema);

module.exports = CategoryChild;
