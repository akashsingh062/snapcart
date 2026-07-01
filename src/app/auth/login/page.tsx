"use client";

import Welcome from "@/components/Welcome";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "../layout";

export default function SignInPage() {
  const { welcomeSeen, setWelcomeSeen } = useAuth();

  return (
    <div>
      {!welcomeSeen ? (
        <Welcome nextStep={() => setWelcomeSeen(true)} />
      ) : (
        <LoginForm previousStep={() => setWelcomeSeen(false)} />
      )}
    </div>
  );
}
