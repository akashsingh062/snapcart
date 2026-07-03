import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";

const AdminDashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  return <div>AdminDashboard</div>;
};

export default AdminDashboard;
