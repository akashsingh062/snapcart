import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectdb();
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const deliveryBoyId = session?.user?.id || session?.session?.userId;
    if (!deliveryBoyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Find assignment by Assignment ID or Order ID
    const assignment = await DeliveryAssignment.findOne({
      $or: [{ _id: id }, { order: id }],
    });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found",
        },
        { status: 404 }
      );
    }

    if (assignment.status === "assigned") {
      if (assignment.assignedTo?.toString() === deliveryBoyId.toString()) {
        return NextResponse.json({
          success: true,
          message: "Assignment is already accepted by you",
        });
      }
      return NextResponse.json(
        {
          success: false,
          message: "Assignment already accepted by another delivery partner",
        },
        { status: 400 }
      );
    }

    if (assignment.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "This delivery assignment has already been completed",
        },
        { status: 400 }
      );
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
      _id: { $ne: assignment._id },
    });

    if (alreadyAssigned) {
      return NextResponse.json(
        {
          success: false,
          message: "You currently have an active delivery in progress. Complete it before accepting a new one.",
        },
        { status: 400 }
      );
    }

    assignment.assignedTo = deliveryBoyId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (order) {
      order.assignedDeliveryBoy = deliveryBoyId;
      order.status = "out of delivery";
      await order.save();
      await order.populate("assignedDeliveryBoy", "name email mobile");

      // Notify admin and user about order status and assigned delivery partner
      await emitEventHandler("order-status-update", {
        orderId: order._id,
        status: order.status,
        assignedDeliveryBoy: order.assignedDeliveryBoy,
      });
    }

    await DeliveryAssignment.updateMany(
      {
        _id: { $ne: assignment._id },
        $or: [{ broadcastedTo: deliveryBoyId }, { brodcastedTo: deliveryBoyId }],
        status: { $in: ["broadcasted", "brodcasted"] },
      },
      {
        $pull: { broadcastedTo: deliveryBoyId, brodcastedTo: deliveryBoyId },
      }
    );

    return NextResponse.json({ success: true, message: "Assignment accepted successfully 🚀" });
  } catch (error) {
    console.error("Accept assignment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return GET(req, { params });
}