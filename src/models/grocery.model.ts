import { timeStamp } from "console";
import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const grocerySchema = new mongoose.Schema<IGrocery>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Fruits & Vegitables",
        "Dairy",
        "Rice, Atta & Grains",
        "Snacks & Branded Foods",
        "Beverages",
        "Frozen Foods",
        "Personal Care",
        "Household Needs",
        "Eggs, Meat & Fish",
        "Oils & Masalas",
        "Baby & Kids",
        "Health & Wellness",
        "Stationery & Office Supplies",
        "Pets & Animals",
        "Home & Kitchen",
      ],
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
  },
  { timestamps: true },
);
const Grocery = mongoose.models.Grocery || mongoose.model("Grocery", grocerySchema);
export default Grocery;