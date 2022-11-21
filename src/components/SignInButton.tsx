"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/Button";

export function SignInButton() {
  const onSignIn = () => {
    signIn("google");
  };

  return <Button onClick={onSignIn}>Sign in with Google</Button>;
}
