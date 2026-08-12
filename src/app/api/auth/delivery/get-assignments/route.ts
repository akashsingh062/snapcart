import connectdb from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";

export async function GET() {
  try {
    await connectdb();
    void Order;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user?.id || session.session?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session" },
        { status: 400 },
      );
    }

    const assignments = await DeliveryAssignment.find({
      $or: [{ broadcastedTo: userId }, { brodcastedTo: userId }],
      status: "broadcasted",
    })
      .populate("order")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, assignments }, { status: 200 });
  } catch (error) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
