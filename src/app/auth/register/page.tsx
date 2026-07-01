"use client";

import Welcome from "@/components/Welcome";
import RegisterForm from "@/components/RegisterForm";
import { useAuth } from "../layout";

export default function SignUpPage() {
  const { welcomeSeen, setWelcomeSeen } = useAuth();
  
  return (
    <div>
      {!welcomeSeen ? (
        <Welcome nextStep={() => setWelcomeSeen(true)} />
      ) : (
        <RegisterForm previousStep={() => setWelcomeSeen(false)} />
      )}
    </div>
  );
}
