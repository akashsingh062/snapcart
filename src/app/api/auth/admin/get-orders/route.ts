import connectdb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectdb();
    const orders = await Order.find({
      $or: [{ paymentMethod: "cod" }, { isPaid: true }],
    })
      .populate("user")
      .populate("assignedDeliveryBoy", "name email mobile")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectdb();
    const { orderId, status, isPaid } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (isPaid !== undefined) updateData.isPaid = isPaid;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    }).populate("user");

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch {
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}