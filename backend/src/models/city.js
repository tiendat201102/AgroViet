const mongoose = require("mongoose");
const citySchema = new mongoose.Schema({
    city_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    region_id: { type: mongoose.Schema.Types.ObjectId, ref: "region", required: true },
    city_name: { type: String, required: true }
});

const City = mongoose.model("city", citySchema);
module.exports = City;