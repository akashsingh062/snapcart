import mongoose from "mongoose";

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
  location: {
    type: {
        type: StringConstructor;
        enum: string[];
        default: string;
    };
    coordinates: {
        type: NumberConstructor[];
        default: number[];
    };
}
}
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user",
    },
    image: {
      type: String,
      required: false,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  },
);
userSchema.index({location:"2dsphere"})
const User = mongoose.models.User || mongoose.model("User", userSchema, "user");

export default User;
