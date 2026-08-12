import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const user = await User.find({ role: "admin" });
    if (user.length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ success: false }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}