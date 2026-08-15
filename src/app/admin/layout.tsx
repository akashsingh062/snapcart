import { auth } from "@/lib/auth";
import connectdb from "@/lib/db";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  await connectdb();
  const user = await User.findOne({ email: session.user?.email });

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const plainUser = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: session.user.image || undefined,
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminNav user={plainUser} />
      <main className="w-full">{children}</main>
    </div>
  );
}
