import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { getDistanceKm } from "@/lib/geo";
import { sendMail } from "@/lib/mailer";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";
import User from "@/models/user.model";
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
    const userEmail = session?.user?.email;

    if (!deliveryBoyId && !userEmail) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const deliveryBoy = await User.findOne({
      $or: [{ _id: deliveryBoyId }, { email: userEmail }],
    });

    if (!deliveryBoy) {
      return NextResponse.json(
        { success: false, message: "Delivery partner profile not found" },
        { status: 404 }
      );
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
      if (assignment.assignedTo?.toString() === deliveryBoy._id.toString()) {
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

    const targetOrder = await Order.findById(assignment.order);
    if (targetOrder && targetOrder.address) {
      const boyLng = deliveryBoy.location?.coordinates?.[0];
      const boyLat = deliveryBoy.location?.coordinates?.[1];
      const orderLat = targetOrder.address.latitude;
      const orderLng = targetOrder.address.longitude;
      const distKm = getDistanceKm(boyLat, boyLng, orderLat, orderLng);

      if (distKm > 10) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot accept order. Order location is ${distKm.toFixed(1)} km away from your location (maximum allowed distance is 10 km).`,
          },
          { status: 400 }
        );
      }
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoy._id,
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

    assignment.assignedTo = deliveryBoy._id;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order).populate("user", "email name");
    if (order) {
      order.assignedDeliveryBoy = deliveryBoyId;
      order.status = "out of delivery";

      if (!order.deliveryOtp) {
        order.deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
      }
      order.deliveryOtpVerification = false;

      await order.save();
      await order.populate("assignedDeliveryBoy", "name email mobile");

      const recipientEmail =
        typeof order.user === "object" && order.user && "email" in order.user
          ? (order.user as { email: string }).email
          : null;

      if (recipientEmail && order.deliveryOtp) {
        sendMail(
          recipientEmail,
          "Your Order is Out for Delivery - SnapCart Verification OTP",
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your Order is Out for Delivery! 🚚</h2>
            <p>Your delivery partner is on the way. Share this OTP with them upon arrival to receive your package:</p>
            <h1 style="color: #047857; letter-spacing: 4px; font-size: 32px;">${order.deliveryOtp}</h1>
            <p>Order ID: <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong></p>
          </div>`
        ).catch(() => {});
      }

      await emitEventHandler("order-status-update", {
        orderId: order._id,
        status: order.status,
        assignedDeliveryBoy: order.assignedDeliveryBoy,
      });
    }

    await emitEventHandler("remove-assignment", { assignmentId: assignment._id.toString() });

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
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to accept assignment",
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