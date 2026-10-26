import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req) {
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
       


         

    if (businessName.length > 150 ||
        email.length > 254 ||
        googleUrl.length > 150 ) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

 

  

   

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
    console.error("Account request failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to submit your request right now." },
      { status: 500 }
    );
  }
}