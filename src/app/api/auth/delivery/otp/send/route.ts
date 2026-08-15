import connectdb from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectdb();
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate("user", "email name");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const recipientEmail =
      typeof order.user === "object" && order.user && "email" in order.user
        ? (order.user as { email: string }).email
        : null;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.deliveryOtp = otp;
    order.deliveryOtpVerification = false;
    await order.save();

    if (recipientEmail) {
      await sendMail(
        recipientEmail,
        "Delivery OTP - SnapCart",
        `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your Delivery Verification OTP</h2>
          <p>Please share this OTP with your delivery partner to complete your order delivery:</p>
          <h1 style="color: #047857; letter-spacing: 4px; font-size: 32px;">${otp}</h1>
          <p>Order ID: <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong></p>
        </div>`
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP generated and sent successfully",
      deliveryOtp: otp,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { success: false, message: "Error sending OTP" },
      { status: 500 }
    );
  }
}

