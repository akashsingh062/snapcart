import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user?.id || session.session?.userId;
    const userEmail = session.user?.email;

    const deliveryBoy = await User.findOne({
      $or: [{ _id: userId }, { email: userEmail }],
    });

    if (!deliveryBoy) {
      return NextResponse.json(
        { success: false, message: "Delivery partner profile not found" },
        { status: 404 }
      );
    }

    // Fetch current active assignment for this delivery boy
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoy._id,
      status: "assigned",
    })
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "name email mobile",
        },
      })
      .sort({ updatedAt: -1 });

    if (!assignment) {
      return NextResponse.json(
        {
          success: true,
          hasActiveOrder: false,
          assignment: null,
          message: "No active order currently assigned",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        hasActiveOrder: true,
        assignment,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Get current active order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
