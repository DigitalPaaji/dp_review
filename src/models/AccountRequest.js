import mongoose from "mongoose";

const AccountRequestSchema = new mongoose.Schema(
  {
    contactName: { type: String, required: true, trim: true, maxlength: 100 },
    businessName: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    googleUrl: { type: String, trim: true, maxlength: 1000, default: "" },
    message: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AccountRequest ||
  mongoose.model("AccountRequest", AccountRequestSchema);