import connectdb from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import User from "@/models/user.model";

export async function POST(req: Request) {
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

    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    const userId = session.user?.id || session.session?.userId;
    const userEmail = session.user?.email;

    const deliveryBoy = await User.findOne({
      $or: [{ _id: userId }, { email: userEmail }],
    });

    if (!deliveryBoy) {
      return NextResponse.json(
        { success: false, message: "Delivery profile not found" },
        { status: 404 }
      );
    }

    // Pull the deliveryBoy's ID from broadcastedTo and brodcastedTo arrays
    await DeliveryAssignment.findByIdAndUpdate(assignmentId, {
      $pull: {
        broadcastedTo: deliveryBoy._id,
        brodcastedTo: deliveryBoy._id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Assignment skipped successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject assignment api error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
