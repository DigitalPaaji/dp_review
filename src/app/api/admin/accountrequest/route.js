import connectDB from "@/lib/mongodb";
import AccountRequest from "@/models/AccountRequest";
import { NextResponse } from "next/server";


export const GET=async(req)=>{
    try {
        await connectDB();
     const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );
    const status = searchParams.get("status") || "";

   const filter = {}

   if(status?.trim()){
filter.status = status
   }


    const skip = (page - 1) * limit;

 const [allRequests, totalRequests] = await Promise.all([
      AccountRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AccountRequest.countDocuments(filter),
    ]);
 const totalPages = Math.ceil(totalRequests / limit);

 return NextResponse.json({
      success: true,
      data: allRequests,
      pagination: {
        currentPage: page,
        limit,
        totalRequests,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }, });

    } catch (error) {
        return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch clients",
      },
      { status: 500 }
    ); 
    }
}






