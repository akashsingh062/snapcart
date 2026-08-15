import connectdb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectdb();
    const { orderId, otp } = await req.json();

    if (!orderId || !otp) {
      return NextResponse.json(
        { success: false, message: "Order ID and OTP are required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.deliveryOtp || order.deliveryOtp.trim() !== String(otp).trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP. Please verify with customer." },
        { status: 400 }
      );
    }

    order.deliveryOtpVerification = true;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully! 🎉",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying OTP" },
      { status: 500 }
    );
  }
}