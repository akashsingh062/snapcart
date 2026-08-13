import connectdb from "@/lib/db";
import ChatRoom from "@/models/chatRoom.model";
import Message from "@/models/message.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectdb();
    void Order;
    void User;
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId is required" },
        { status: 400 }
      );
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: unknown) {
    console.error("Chat messages error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
