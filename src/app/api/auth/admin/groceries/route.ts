import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET all groceries (Admin)
export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const groceries = await Grocery.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        groceries,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Fetch groceries error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch groceries",
      },
      { status: 500 }
    );
  }
}
