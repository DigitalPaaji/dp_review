import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client"

export const DELETE= async(request, { params })=>{
  const { id } = await params;
  await connectDB();
  const client = await Client.findByIdAndDelete(id);
   if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found",
        },
        { status: 404 }
      );
    }

     return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
   
    });
}