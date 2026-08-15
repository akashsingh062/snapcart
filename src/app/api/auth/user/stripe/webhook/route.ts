import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!sig) return NextResponse.json({ error: "Missing stripe signature" }, { status: 401 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid stripe webhook signature" }, { status: 400 });
  }

  if (event?.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session?.metadata?.orderId) {
        return NextResponse.json({ error: "Missing orderId metadata" }, { status: 400 });
      }

      await connectdb();
      const updatedOrder = await Order.findByIdAndUpdate(
        session.metadata.orderId,
        {
          isPaid: true,
          paymentMethod: "online",
        },
        { new: true }
      ).populate("user");

      if (updatedOrder) {
        await emitEventHandler("new-order", updatedOrder);
        await emitEventHandler("order-status-update", {
          orderId: updatedOrder._id,
          status: updatedOrder.status,
          isPaid: true,
        });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to process completed checkout session" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}