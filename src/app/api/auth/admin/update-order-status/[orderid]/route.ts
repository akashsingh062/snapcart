import connectdb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      orderid: string;
    };
  },
) {
  try {
    await connectdb()
    const orderId = params.orderid;
    const { status } = await req.json();
    const order = await Order.findById(orderId).populate("user")
    if(!order){
        return NextResponse.json({error:"Order not found"},{status:404})
    }
    order.status = status;
    // let availableDeliverBoys:any = []
    if(status == "out of delivery" && !order.assignment){

    }
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
