import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import emitEventHandler from "@/lib/emitEventHandler";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const reqBody = await req.json();
    const { items, totalAmount, paymentMethod, address } = reqBody;
    if (!items || !totalAmount || !paymentMethod || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      paymentMethod,
      address,
    });

    await emitEventHandler("new-order", order)
    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDb();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const orders = await Order.find({ user: user._id })
      .populate("assignedDeliveryBoy", "name mobile image")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
