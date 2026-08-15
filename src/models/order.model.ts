import mongoose from "mongoose";

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: Array<{
    grocery: mongoose.Types.ObjectId;
    name: string;
    price: string;
    unit: string;
    image: string;
    quantity: number;
  }>;
  isPaid:boolean;
  totalAmount: string;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignment?:mongoose.Types.ObjectId;
  assignedDeliveryBoy?:mongoose.Types.ObjectId;
  status:
    | "pending"
    | "out of delivery"
    | "delivered"
    | "cannot be delivered"
    | "order cannot be delivered";
  createdAt?: Date;
  updatedAt?: Date;
  deliveryOtp:string|null,
  deliveryOtpVerification:boolean,
  deliveredAt:Date|null,
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
    address: {
      fullName: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    assignment:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "out of delivery",
        "delivered",
        "cannot be delivered",
        "order cannot be delivered",
      ],
      default: "pending",
    },
    deliveryOtp:{
      type:String,
      default:null,
    },
    deliveryOtpVerification:{
      type:Boolean,
      default:false,
    },
    deliveredAt:{
      type:Date,
      default:null,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models && mongoose.models.Order) {
  delete (mongoose.models as Record<string, unknown>).Order;
}

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
export default Order;