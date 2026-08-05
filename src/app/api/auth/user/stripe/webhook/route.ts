import connectdb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 401 });
  let event;
  try {
    event = await stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log("stripe webhook error", error);
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (event?.type == "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session) return NextResponse.json({ error: "invalid" }, { status: 400 });
      await connectdb()
      await Order.findByIdAndUpdate(session?.metadata?.orderId,{
        isPaid:true,
        paymentMethod:"online",
      })
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.log("stripe webhook error", error);
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
  }
}