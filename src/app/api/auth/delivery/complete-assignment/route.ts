import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function completeAssignment(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    let assignmentId = searchParams.get("assignmentId");

    if (!assignmentId && req.method === "POST") {
      try {
        const body = await req.json();
        assignmentId = body.assignmentId;
      } catch (e) {
        // Body optional
      }
    }

    let assignment;
    if (assignmentId) {
      assignment = await DeliveryAssignment.findOne({
        $or: [{ _id: assignmentId }, { order: assignmentId }],
      });
    } else {
      assignment = await DeliveryAssignment.findOne({
        assignedTo: deliveryBoy._id,
        status: "assigned",
      });
    }

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Active delivery assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.status === "completed") {
      return NextResponse.json(
        { success: true, message: "Assignment is already completed" },
        { status: 200 }
      );
    }

    assignment.status = "completed";
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (order) {
      order.status = "delivered";
      order.isPaid = true;
      await order.save();

      await emitEventHandler("order-status-update", {
        orderId: order._id,
        status: order.status,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order marked as Delivered successfully! 🎉",
        assignment,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Complete assignment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return completeAssignment(req);
}

export async function POST(req: NextRequest) {
  return completeAssignment(req);
}
