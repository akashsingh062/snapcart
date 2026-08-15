import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectdb();
    void Order; // Register Order model schema

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

    // Fetch all completed assignments for this delivery partner
    const completedAssignments = await DeliveryAssignment.find({
      assignedTo: deliveryBoy._id,
      status: "completed",
    })
      .populate("order")
      .sort({ updatedAt: -1 });

    const totalCompleted = completedAssignments.length;

    // Calculate metrics
    let totalCodCollected = 0;
    let totalOnlineDelivered = 0;
    let completedToday = 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const history = completedAssignments.map((asgn) => {
      const ord = asgn.order as unknown as {
        _id?: string;
        totalAmount?: string;
        paymentMethod?: string;
        isPaid?: boolean;
        address?: {
          fullName?: string;
          mobile?: string;
          city?: string;
          fullAddress?: string;
        };
        createdAt?: string;
      };

      const orderAmount = parseFloat(ord?.totalAmount || "0") || 0;
      if (ord?.paymentMethod?.toLowerCase() === "cod") {
        totalCodCollected += orderAmount;
      } else {
        totalOnlineDelivered++;
      }

      const completedDate = new Date(asgn.updatedAt || asgn.createdAt || Date.now());
      if (completedDate >= todayStart) {
        completedToday++;
      }

      return {
        assignmentId: asgn._id,
        orderId: ord?._id ? String(ord._id) : "N/A",
        customerName: ord?.address?.fullName || "Valued Customer",
        customerMobile: ord?.address?.mobile || "N/A",
        fullAddress: ord?.address?.fullAddress || "Delivery Address",
        city: ord?.address?.city || "",
        totalAmount: orderAmount,
        paymentMethod: ord?.paymentMethod || "cod",
        isPaid: ord?.isPaid ?? true,
        completedAt: asgn.updatedAt || asgn.createdAt,
        earning: 50, // ₹50 fixed payout per delivery
      };
    });

    // ₹50 per completed delivery + ₹150 bonus if > 5 orders today
    const baseEarnings = totalCompleted * 50;
    const bonusEarnings = completedToday >= 5 ? 150 : 0;
    const totalEarnings = baseEarnings + bonusEarnings;

    return NextResponse.json(
      {
        success: true,
        metrics: {
          totalCompleted,
          completedToday,
          totalEarnings,
          totalCodCollected,
          totalOnlineDelivered,
          dailyGoal: 10,
          onTimeRate: "98.5%",
        },
        history,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load progress data",
      },
      { status: 500 }
    );
  }
}
