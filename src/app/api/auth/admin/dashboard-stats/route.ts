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
    const cancelledOrders = orders.filter(
      (o) =>
        o.status?.toLowerCase() === "cannot be delivered" ||
        o.status?.toLowerCase() === "cannot_be_delivered"
    ).length;

    const totalRevenue = orders
      .filter((o) => o.status?.toLowerCase() === "delivered" || o.isPaid)
      .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);

    const codRevenue = orders
      .filter(
        (o) =>
          o.paymentMethod?.toLowerCase() === "cod" &&
          (o.status?.toLowerCase() === "delivered" || o.isPaid)
      )
      .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);

    const onlineRevenue = orders
      .filter(
        (o) =>
          o.paymentMethod?.toLowerCase() !== "cod" &&
          (o.status?.toLowerCase() === "delivered" || o.isPaid)
      )
      .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);

    const recentOrders = orders.slice(0, 8).map((o) => ({
      _id: o._id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod,
    }));

    // Build daily order trends for the last 7 days
    const dailyTrends: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayOrders = orders.filter((o) => {
        const created = new Date(o.createdAt);
        return created >= d && created < nextD;
      });

      const dayRevenue = dayOrders
        .filter((o) => o.status?.toLowerCase() === "delivered" || o.isPaid)
        .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);

      dailyTrends.push({
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        orders: dayOrders.length,
        revenue: Math.round(dayRevenue),
      });
    }

    // Order status distribution for pie/donut visual
    const statusDistribution = [
      { name: "Pending", value: pendingOrders, color: "#3B82F6" },
      { name: "Out for Delivery", value: outOfDeliveryOrders, color: "#F59E0B" },
      { name: "Delivered", value: deliveredOrders, color: "#10B981" },
      { name: "Undeliverable", value: cancelledOrders, color: "#EF4444" },
    ].filter((s) => s.value > 0);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalOrders,
          pendingOrders,
          outOfDeliveryOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          codRevenue,
          onlineRevenue,
          totalProducts,
          deliveryBoysCount,
        },
        recentOrders,
        dailyTrends,
        statusDistribution,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load dashboard stats",
      },
      { status: 500 }
    );
  }
}
