import { auth } from "@/lib/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { headers } from "next/headers";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: authSession.user?.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const reqBody = await req.json();
    const { items, totalAmount, address } = reqBody;
    if (!items || !totalAmount || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 1. Create order with isPaid: false (payment pending)
    const order = await Order.create({
      user: user._id,
      items,
      totalAmount: String(totalAmount),
      paymentMethod: "online",
      address,
      isPaid: false,
      status: "pending",
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BETTER_AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // 2. Create Stripe Checkout session with orderId in metadata
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "SnapCart Grocery Order",
            },
            unit_amount: Math.round(Number(totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/user/order-success?orderId=${order._id.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/user/checkout?cancel=true`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    return NextResponse.json({ sessionUrl: stripeSession.url }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to initiate payment session. Please try again." },
      { status: 500 }
    );
  }
}