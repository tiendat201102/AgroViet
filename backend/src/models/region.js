const mongoose = require("mongoose");
const regionSchema = new mongoose.Schema({
    region_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    region_name: { type: String, required: true }
});
const Region = mongoose.model("region", regionSchema);
module.exports = Region;