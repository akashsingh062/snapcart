import connectdb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { getDistanceKm } from "@/lib/geo";
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
    let { status } = await req.json();
    if (status?.toLowerCase().includes("cannot be delivered")) {
      status = "cannot be delivered";
    }
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
        let nearByDeliveryBoys: InstanceType<typeof User>[] = [];
        if (latitude !== undefined && longitude !== undefined) {
          try {
            const allDeliveryBoys = await User.find({ role: "deliveryBoy" });
            nearByDeliveryBoys = allDeliveryBoys.filter((boy) => {
              const boyLng = boy.location?.coordinates?.[0];
              const boyLat = boy.location?.coordinates?.[1];
              const dist = getDistanceKm(latitude, longitude, boyLat, boyLng);
              return dist <= 10;
            });
          } catch (err) {
            console.error("Geo search error:", err);
          }
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
          order.status = "cannot be delivered";
          await order.save();
          await emitEventHandler("order-status-update", { orderId: order._id, status: order.status });
          return NextResponse.json(
            {
              success: true,
              message: "No delivery partners available within 10 km radius. Order marked as 'cannot be delivered'.",
              status: order.status,
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
          const rawBoys = await User.find({ _id: { $in: boyIds } });
          const { latitude, longitude } = order.address || {};
          const boys = rawBoys.filter((b) => {
            const boyLng = b.location?.coordinates?.[0];
            const boyLat = b.location?.coordinates?.[1];
            const dist = getDistanceKm(latitude, longitude, boyLat, boyLng);
            return dist <= 10;
          });

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
