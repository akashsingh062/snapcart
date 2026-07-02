import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectdb from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";
import EditRoleMobile from "@/components/EditRoleMobile";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoyDashboard from "@/components/DeliveryBoyDashboard";


export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await connectdb();
  const user = await User.findById(session?.session?.userId as string);
  if (!user) {
    redirect("/auth/login");
  }
  const inComplete =
    !user.mobile || !user.role || (!user.mobile && user.role !== "user");
  if (inComplete) {
    return <EditRoleMobile />;
  }

  const plainUser = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    mobile: user.mobile,
    image: session?.user.image || undefined,
  };

  return (
    <>
      <Nav user={plainUser} />
      {user.role == "user" && <UserDashboard />}
      {user.role == "admin" && <AdminDashboard />}
      {user.role == "delivery-boy" && <DeliveryBoyDashboard />}
    </>
  );
}
