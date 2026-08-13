import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
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

    const user = await User.findOne({ email: session.user?.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    // Fetch dashboard metrics
    const [orders, totalProducts, deliveryBoysCount] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }),
      Grocery.countDocuments({}),
      User.countDocuments({ role: "deliveryBoy" }),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status?.toLowerCase() === "pending"
    ).length;
    const outOfDeliveryOrders = orders.filter(
      (o) =>
        o.status?.toLowerCase() === "out of delivery" ||
        o.status?.toLowerCase() === "out_of_delivery"
    ).length;
    const deliveredOrders = orders.filter(
      (o) => o.status?.toLowerCase() === "delivered"
    ).length;

    const totalRevenue = orders
      .filter((o) => o.status?.toLowerCase() === "delivered" || o.isPaid)
      .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);

    const recentOrders = orders.slice(0, 5).map((o) => ({
      _id: o._id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod,
    }));

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalOrders,
          pendingOrders,
          outOfDeliveryOrders,
          deliveredOrders,
          totalRevenue,
          totalProducts,
          deliveryBoysCount,
        },
        recentOrders,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Fetch admin stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load dashboard stats",
      },
      { status: 500 }
    );
  }
}
