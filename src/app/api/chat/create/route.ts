import connectdb from "@/lib/db";
import ChatRoom from "@/models/chatRoom.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectdb();
    void Order;
    void User;
    const { orderId, userId, deliveryBoyId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    let room = await ChatRoom.findOne({ orderId });
    if (!room) {
      const roomData: Record<string, unknown> = { orderId };
      if (userId) roomData.userId = userId;
      if (deliveryBoyId) roomData.deliveryBoyId = deliveryBoyId;

      room = await ChatRoom.create(roomData);
    } else {
      let updated = false;
      if (userId && !room.userId) {
        room.userId = userId;
        updated = true;
      }
      if (deliveryBoyId && !room.deliveryBoyId) {
        room.deliveryBoyId = deliveryBoyId;
        updated = true;
      }
      if (updated) {
        await room.save();
      }
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error: unknown) {
    console.error("Chat create error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
