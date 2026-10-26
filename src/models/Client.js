import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    businessName: { type: String, required: true },
    placeId: { type: String, required: true },
    googleUrl: { type: String, required: true },
    hasGeneratedQr: { type: Boolean, default: false },
    savedQrUrl: { type: String, default: "" },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Client ||
  mongoose.model("Client", ClientSchema);