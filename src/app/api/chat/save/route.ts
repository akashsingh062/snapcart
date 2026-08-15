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
    const { senderId, text, roomId, time } = await req.json();

    if (!roomId || !senderId || !text) {
      return NextResponse.json(
        { success: false, message: "roomId, senderId, and text are required" },
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

    const message = await Message.create({
      senderId,
      text,
      roomId,
      time: time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save message",
      },
      { status: 500 }
    );
  }
}
