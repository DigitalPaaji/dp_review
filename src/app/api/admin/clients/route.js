import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Client from "@/models/Client"
import bcrypt from "bcryptjs";



export const GET=async(req)=>{
try {
    
     await connectDB();

 const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );


    const skip = (page - 1) * limit;

    const [allClients, totalClients] = await Promise.all([
      Client.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Client.countDocuments(),
    ]);
 const totalPages = Math.ceil(totalClients / limit);

 return NextResponse.json({
      success: true,
      data: allClients,
      pagination: {
        currentPage: page,
        limit,
        totalClients,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
} catch (error) {
    console.error("Get clients error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients",
      },
      { status: 500 }
    );
}
} 

export const POST= async(req)=>{
    try {
       await connectDB();
          const { email, password ,businessName,placeId,googleUrl} = await req.json();
     
          if(!email || !password || !businessName || !placeId || !googleUrl){
         
          return NextResponse.json(
          {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
          }
      

  const allreadyexist = await Client.findOne({email});
 if(allreadyexist){
      return NextResponse.json(
            {
              success: false,
              message: "Email Allready Exist.",
            },
            { status: 400 }
          );
 }




 let parsedUrl;
    try {
      parsedUrl = new URL(googleUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Enter a valid Google review URL." },
        { status: 400 }
      );
    }


const passwordHash = await bcrypt.hash(password, 12);
const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
   await Client.create({
      email,
      passwordHash,
      businessName,
      placeId,
      googleUrl,
      expiryDate,
    });

 return NextResponse.json({
      success: true,
      message:"Client created",
      
    });

    } catch (error) {
        
    }
}







