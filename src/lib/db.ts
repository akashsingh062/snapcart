import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URL;
if (!mongodbUrl) {
  throw new Error("MONGODB_URL environment variable is not defined");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectdb = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUrl)
      .then((conn) => conn.connection);
  }
  try {
    const conn = await cached.promise;
    return conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectdb;