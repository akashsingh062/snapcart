import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await connectdb();
    const userId = session.session?.userId || session.user?.id;
    let user = null;
    if (userId) {
      user = await User.findById(userId).select("-password");
    }
    if (!user && session.user?.email) {
      user = await User.findOne({ email: session.user.email }).select("-password");
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success:true,
      user
    },{status:200})
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success:false,
      message:"Internal Server Error",
    },{status:500})
  }
}
