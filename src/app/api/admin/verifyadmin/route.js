import { getSession } from "@/lib/auth";
import Admin from "@/models/Admin";

export async function GET(req) {
  try {
  
    const session = await getSession(req);
    
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required."},
        { status: 403 }
      );
    }

    await connectDB();
    const admin = await Admin.findById(session.userId);







    return NextResponse.json({
      success: true,
      admin,
    });




  } catch (error) {
    console.error("Fetch clients failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to fetch clients." },
      { status: 500 }
    );
  }
}