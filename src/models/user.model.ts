import mongoose from "mongoose";

interface IUser {
    _id?:mongoose.Types.ObjectId
    name:string
    email:string
    password:string
    mobile?:string
    role:"user" | "deliveryBoy" | "admin"
}
const userSchema = new mongoose.Schema<IUser>({
   name:{
    type:String,
    required:true,
    trim:true
   },
   email:{
    type:String,
    required:true,
    unique:true,
    trim:true
   },
   password:{
    type:String,
    required:true,
    trim:true
   },
   mobile:{
    type:String,
    required:false,
    trim:true
   },
   role:{
    type:String,
    required:true,
    enum:["user","deliveryBoy","admin"],
    default:"user"
   }
},{
    timestamps:true
})

const User = mongoose.models.User || mongoose.model("User",userSchema)

export default User