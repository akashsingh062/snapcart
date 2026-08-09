import connectdb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try{
        await connectdb()
        const {userId, socketId} = await request.json()
        const user = await User.findByIdAndUpdate(userId, {
            socketId:socketId,
            isOnline:true
        },{returnDocument: "after"})
        if(!user){
            return NextResponse.json({message:"User not found"},{status:404})
        }
        return NextResponse.json({message:"Socket connected", user},{status:200})
    }catch(err){
        console.log(err)
        return NextResponse.json({message:"Failed to connect socket"},{status:500})
    }
}
    