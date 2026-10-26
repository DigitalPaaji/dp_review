import mongoose from "mongoose";



const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  
    otp:{
        type:String,
        required:true
    },
    
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);


export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);