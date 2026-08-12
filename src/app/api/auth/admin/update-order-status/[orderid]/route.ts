import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.modal";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      orderid: string;
    }>;
  },
) {
  try {
    await connectdb();
    const { orderid: orderId } = await params;
    const { status } = await req.json();
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    order.status = status;
    if (status?.toLowerCase() === "delivered") {
      order.isPaid = true;
    }
    let deliveryBoysPayload: {
      id: unknown;
      name: string;
      mobile: string;
      latitude: number;
      longitude: number;
      socketId?: string;
    }[] = [];
    if (status == "out of delivery") {
      if (!order.assignment) {
        const { latitude, longitude } = order.address || {};
        let nearByDeliveryBoys = [];
        if (latitude !== undefined && longitude !== undefined) {
          try {
            nearByDeliveryBoys = await User.find({
              role: "deliveryBoy",
              location: {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)],
                  },
                  $maxDistance: 10000,
                },
              },
            });
          } catch (err) {
            console.error("2dsphere geo search error:", err);
          }
        }

        if (nearByDeliveryBoys.length === 0) {
          nearByDeliveryBoys = await User.find({ role: "deliveryBoy" });
        }

        const nearByIds = nearByDeliveryBoys.map((boy) => boy._id);
        const busyIds = await DeliveryAssignment.find({
          assignedTo: {
            $in: nearByIds,
          },
          status: { $nin: ["broadcasted", "completed"] },
        }).distinct("assignedTo");
        const busyIdSet = new Set(busyIds.map((b) => String(b)));
        const availableDeliverBoys = nearByDeliveryBoys.filter(
          (boy) => !busyIdSet.has(String(boy._id)),
        );
        const candidates = availableDeliverBoys.map((boy) => boy._id);
        if (candidates.length == 0) {
          await order.save();
          await emitEventHandler("order-status-update", {orderId: order._id,status:order.status})
          return NextResponse.json(
            {
              message: "No Delivery Boy available for this order",
            },
            { status: 200 },
          );
        }
        const deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          broadcastedTo: candidates,
          brodcastedTo: candidates,
          status: "broadcasted",
        });
        order.assignment = deliveryAssignment._id;
        deliveryBoysPayload = availableDeliverBoys.map((b) => ({
          id: b._id,
          name: b.name,
          mobile: b.mobile,
          latitude: b.location?.coordinates?.[1] ?? 0,
          longitude: b.location?.coordinates?.[0] ?? 0,
          socketId: b.socketId,
        }));
        await deliveryAssignment.populate("order");
        const plainAssignment = JSON.parse(JSON.stringify(deliveryAssignment));

        for (const boy of availableDeliverBoys) {
          if (boy.socketId) {
            await emitEventHandler("new-assignment", plainAssignment, boy.socketId);
          }
        }
        await emitEventHandler("new-assignment", plainAssignment);
      } else {
        const existingAssignment = await DeliveryAssignment.findById(
          order.assignment,
        ).populate("order");

        if (existingAssignment) {
          const plainAssignment = JSON.parse(JSON.stringify(existingAssignment));
          const boyIds =
            existingAssignment.broadcastedTo?.length
              ? existingAssignment.broadcastedTo
              : existingAssignment.brodcastedTo || [];
          let boys = await User.find({ _id: { $in: boyIds } });
          if (boys.length === 0) {
            boys = await User.find({ role: "deliveryBoy" });
          }
          deliveryBoysPayload = boys.map((b) => ({
            id: b._id,
            name: b.name,
            mobile: b.mobile,
            latitude: b.location?.coordinates?.[1] ?? 0,
            longitude: b.location?.coordinates?.[0] ?? 0,
            socketId: b.socketId,
          }));

          for (const boy of boys) {
            if (boy.socketId) {
              await emitEventHandler("new-assignment", plainAssignment, boy.socketId);
            }
          }
          await emitEventHandler("new-assignment", plainAssignment);
        }
      }
    }
    await order.save()
    await emitEventHandler("order-status-update", {orderId: order._id,status:order.status})
    await order.populate("user")
    return NextResponse.json({
      assignment:order.assignment?._id,
      availableBoys:deliveryBoysPayload
    },{status:200})
  } catch (error) {
    return NextResponse.json(
      { message : `Update status error ${error}` },
      { status: 500 },
    );
  }
}
