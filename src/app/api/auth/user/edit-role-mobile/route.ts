import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try {
        await connectdb()
        const {role, mobile} = await req.json()
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const user = await User.findByIdAndUpdate(session?.session?.userId as string, {role, mobile}, {new: true})
        if(!user){
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }
        return NextResponse.json({
            success: true,
            user,
            message: "User role and mobile updated successfully"
        }, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: `Edit role and mobile error. ${error}`
        }, {
            status: 500
        })
    }
}