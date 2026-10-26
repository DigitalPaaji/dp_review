import connectDB from "@/lib/mongodb";
import AccountRequest from "@/models/AccountRequest";
import { NextResponse } from "next/server";



const ALLOWED_STATUSES = [
  "pending",
  "contacted",
  "approved",
  "rejected",
];


export const PATCH= async(request,{params})=>{
try {
        await connectDB();
const { id } = await params;


const body = await request.json();
const { status } = body;

  if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }
 const updatedRequest = await AccountRequest.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    );

  
   if (!updatedRequest) {
      return NextResponse.json(
        { success: false, message: "Account request not found" },
        { status: 404 }
      );
    }

 return NextResponse.json(
      {
        success: true,
        message: "Status updated successfully",
        data: updatedRequest,
      },
      { status: 200 }
    );

} catch (error) {
   return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );   
}
}