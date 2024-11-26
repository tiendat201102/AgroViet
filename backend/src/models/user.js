
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, unique: true },
    user_role_id: { type: mongoose.Schema.Types.ObjectId, ref: "role", required: true },
    image: { type: String},
    region_id: { type: mongoose.Schema.Types.ObjectId, ref: "region" },  
    city_id: { type: mongoose.Schema.Types.ObjectId, ref: "city" }, 
    // address: {type: String},
    isAdmin: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // role_id: { type: String,enum: ['USER', 'FARMER', 'ADMIN'] ,default: 'USER' },
    name: String,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], default: "MALE" },
    phone: String,
    is_farmer: { type: Boolean, default: false },
    application_status: { type: String, enum: ["unavailable", "pending", "approved", "rejected"], default: "unavailable" },
    farm_name: String,
    farm_logo: String,
    farm_phone: String,
    farm_region_id: { type: mongoose.Schema.Types.ObjectId, ref: "region" },
    farm_city_id: { type: mongoose.Schema.Types.ObjectId, ref: "city" },
    farm_detail: String,
    farm_banner: String,
    is_hidden: { type: Boolean, default: false },
    rejection_reason: { type: String, default: "" } 
});

const User = mongoose.model("user", userSchema);

module.exports = User;
