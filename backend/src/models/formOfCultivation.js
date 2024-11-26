const mongoose = require("mongoose");

const cultivationSchema = new mongoose.Schema({
    cultivation_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    method_name: { type: String, required: true }
});

const Cultivation = mongoose.model("cultivation", cultivationSchema);
module.exports = Cultivation;