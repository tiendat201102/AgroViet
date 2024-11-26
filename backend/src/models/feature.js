const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
    feature_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    feature_name: { type: String, required: true }
});

const Feature = mongoose.model("feature", featureSchema);
module.exports = Feature;