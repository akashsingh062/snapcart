import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import uploadOnCloudnary from "@/lib/cloudinary";
import connectdb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectdb(); 
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (session?.user?.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
      });
    }
    const formData =await req.formData()
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as Blob | null;
    let imageUrl
    if(file){
      imageUrl = await uploadOnCloudnary(file);
    }
    const grocery = await Grocery.create({
        name, price, category, unit, image:imageUrl
    })
    return NextResponse.json({
        success: true,
        grocery,
        message: "Grocery added successfully",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to add grocery",
    });
  }
}