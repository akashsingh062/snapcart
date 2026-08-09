import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectdb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectdb();
    const { userId, location } = await req.json();
    if (!userId || !location) {
      return NextResponse.json(
        { error: "Missing userId or Location" },
        { status: 400 },
      );
    }
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { location },
      { returnDocument: "after" },
    );
    if(!user){
        return NextResponse.json({error:"User not found"},{status:404})
    }
    return NextResponse.json({message:"Location Updated!"},{status:200})
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update location" }, { status: 500 });
  }
}
