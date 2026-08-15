import connectdb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
        await connectdb()
        const {orderId,otp} = await req.json()
        const order = await Order.findById(orderId)
        if(!order){
            return NextResponse.json({message:"Order not found"}, {status:404});
        }
        if(order.deliveryOtp !== otp){
            return NextResponse.json({message:"Invalid OTP"}, {status:400});
        }
        order.deliveryOtp = "";
        await order.save()
        return NextResponse.json({message:"OTP verified successfully"});
    }catch(error){
        console.error("Error verifying OTP:",error);
        return NextResponse.json({message:"Error verifying OTP"}, {status:500});
    }
}