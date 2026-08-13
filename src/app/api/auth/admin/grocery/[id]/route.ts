import { auth } from "@/lib/auth";
import uploadOnCloudnary from "@/lib/cloudinary";
import connectdb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// PUT: Update a grocery item by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    const existingGrocery = await Grocery.findById(id);
    if (!existingGrocery) {
      return NextResponse.json(
        { success: false, message: "Grocery item not found" },
        { status: 404 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let name = existingGrocery.name;
    let category = existingGrocery.category;
    let unit = existingGrocery.unit;
    let price = existingGrocery.price;
    let imageUrl = existingGrocery.image;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = (formData.get("name") as string) || name;
      category = (formData.get("category") as string) || category;
      unit = (formData.get("unit") as string) || unit;
      price = (formData.get("price") as string) || price;

      const file = formData.get("image") as Blob | null;
      if (file && file.size > 0) {
        const uploadedUrl = await uploadOnCloudnary(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }
    } else {
      const body = await req.json();
      name = body.name || name;
      category = body.category || category;
      unit = body.unit || unit;
      price = body.price || price;
      imageUrl = body.image || imageUrl;
    }

    const updatedGrocery = await Grocery.findByIdAndUpdate(
      id,
      {
        name,
        category,
        unit,
        price,
        image: imageUrl,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        grocery: updatedGrocery,
        message: "Grocery updated successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Update grocery error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update grocery",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a grocery item by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    const deletedGrocery = await Grocery.findByIdAndDelete(id);
    if (!deletedGrocery) {
      return NextResponse.json(
        { success: false, message: "Grocery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Grocery item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Delete grocery error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete grocery",
      },
      { status: 500 }
    );
  }
}
