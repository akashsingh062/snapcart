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
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden font-sans p-4">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {user ? (
        /* Authenticated Dashboard Card */
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
                  user.role || "user"
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
      ) : (
        /* Unauthenticated Landing / Call-To-Action Card */
        <div className="relative w-full max-w-md bg-white/3 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-indigo-200 via-white to-violet-200 bg-clip-text text-transparent mb-3">
            SnapCard Security
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Welcome to SnapCard. Log in or create a secure account to access your personalized card workspace.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              href="/sign-in"
              className="block w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="block w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-white font-semibold text-sm active:scale-[0.98] transition-all duration-200"
            >
              Create an Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
