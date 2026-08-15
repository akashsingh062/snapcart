import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: "Missing sessionId or orderId" }, { status: 400 });
    }

    await connectdb();

    // 1. Retrieve session directly from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status === "paid" || stripeSession.status === "complete") {
      // 2. Update order in database to Paid
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          isPaid: true,
          paymentMethod: "online",
        },
        { new: true }
      ).populate("user");

      if (updatedOrder) {
        const plainOrder = JSON.parse(JSON.stringify(updatedOrder));
        await emitEventHandler("new-order", plainOrder);
        await emitEventHandler("order-status-update", {
          orderId: updatedOrder._id.toString(),
          status: updatedOrder.status,
          isPaid: true,
        });
      }

      return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Payment not completed yet" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
