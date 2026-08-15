import connectdb from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { getDistanceKm } from "@/lib/geo";

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
    const userEmail = session.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session" },
        { status: 400 },
      );
    }

    const deliveryBoy = await User.findOne({
      $or: [{ _id: userId }, { email: userEmail }],
    });

    if (!deliveryBoy) {
      return NextResponse.json(
        { success: false, message: "Delivery profile not found" },
        { status: 404 },
      );
    }

    const boyLng = deliveryBoy.location?.coordinates?.[0];
    const boyLat = deliveryBoy.location?.coordinates?.[1];

    const rawAssignments = await DeliveryAssignment.find({
      $or: [{ broadcastedTo: deliveryBoy._id }, { brodcastedTo: deliveryBoy._id }],
      status: "broadcasted",
    })
      .populate("order")
      .sort({ createdAt: -1 });

    const assignments = rawAssignments.filter((assignment) => {
      const order = assignment.order as unknown as { address?: { latitude?: number; longitude?: number } } | null;
      if (!order || !order.address) return false;
      const orderLat = order.address.latitude;
      const orderLng = order.address.longitude;
      const dist = getDistanceKm(boyLat, boyLng, orderLat, orderLng);
      return dist <= 10;
    });

    return NextResponse.json({ success: true, assignments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch delivery assignments" },
      { status: 500 },
    );
  }
}

