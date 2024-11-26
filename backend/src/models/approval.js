const mongoose = require("mongoose");
const approvalSchema = new mongoose.Schema({
    approval_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: () => new mongoose.Types.ObjectId(), 
        required: true, 
        unique: true 
    },
    blog_post_id: { type: mongoose.Schema.Types.ObjectId, ref: "blog_post", required: true },
    approval_status: { 
        type: String, 
        enum: ["waiting", "approved", "rejected"],
        default: "waiting"
    },
    rejection_reason: { type: String, default: "" }
});

const Approval = mongoose.model("approval", approvalSchema);
module.exports = Approval;
