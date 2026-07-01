import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import LogoutButton from "./logout-button";

interface CustomUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user as CustomUser | undefined;

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-amber-500/10 border border-amber-500/30 text-amber-400";
      case "deliveryBoy":
        return "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400";
      default:
        return "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "deliveryBoy":
        return "Delivery Agent";
      default:
        return "Standard User";
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-800 bg-white">
      {user ? (
        /* Authenticated Dashboard View */
        <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden p-4">
          {/* Background Decorative Gradient Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

          <div className="relative w-full max-w-lg bg-white/3 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-white/15">
            <div className="flex flex-col items-center text-center">
              {/* Avatar Circle */}
              <div className="relative h-24 w-24 rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20 mb-6">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-extrabold tracking-wider">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-white to-violet-200 bg-clip-text text-transparent">
                {user.name}
              </h1>

              {/* Role Badge */}
              <div className="mt-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${getRoleBadgeStyles(
                    user.role || "user",
                  )}`}
                >
                  {getRoleDisplayName(user.role || "user")}
                </span>
              </div>

              <div className="w-full border-t border-white/10 my-6"></div>

              {/* Profile Fields */}
              <div className="w-full space-y-4 text-left">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Email Address
                  </span>
                  <span className="text-sm text-slate-200 font-medium">
                    {user.email}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Account Verified
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-200 font-medium">
                    {user.emailVerified ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Verified
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        Pending Verification
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="w-full border-t border-white/10 my-6"></div>

              <div className="flex gap-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unauthenticated Splash Page (Left screen in the reference) */
        <div className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-6 md:p-12 select-none">
          <div className="max-w-md text-center flex flex-col items-center">
            {/* Snapcart Header Logo */}
            <div className="flex items-center gap-2 mb-6">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-5xl font-extrabold text-green-600 tracking-tight">
                Snapcart
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-12 max-w-sm">
              Your one-stop destination for fresh groceries, organic produce,
              and daily essentials delivered right to your doorstep.
            </p>

            {/* Large Basket & Bicycle Graphics */}
            <div className="flex items-center justify-center gap-12 mb-12">
              {/* Basket outline */}
              <svg
                className="h-28 w-28 text-green-600 animate-bounce"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {/* Bicycle outline */}
              <svg
                className="h-28 w-28 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5.5" cy="17.5" r="2.5" />
                <circle cx="18.5" cy="17.5" r="2.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h8.5M12 9l3.5-5.5H19M5.5 15l3.5-6h3"
                />
              </svg>
            </div>

            {/* Next Button linking to Login */}
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-10 py-3.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm active:scale-[0.98] transition-all duration-200 shadow-md shadow-green-600/10 cursor-pointer"
            >
              Next
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
