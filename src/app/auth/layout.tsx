"use client";

import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  welcomeSeen: boolean;
  setWelcomeSeen: (seen: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [welcomeSeen, setWelcomeSeen] = useState(false);

  return (
    <AuthContext.Provider value={{ welcomeSeen, setWelcomeSeen }}>
      <div className="w-full min-h-screen bg-linear-to-b from-green-100 to-white">
        {children}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthLayout Context Provider");
  }
  return context;
}
