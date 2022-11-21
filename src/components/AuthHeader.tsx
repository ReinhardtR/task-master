"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export function AuthHeaderSection() {
  const session = useSession(); // switch to getServerSession and RSC when next-auth issue is fixed

  return (
    <>
      {session.status === "authenticated" ? (
        <SignOutButton name={session.data.user?.name!} />
      ) : (
        <SignInButton />
      )}
    </>
  );
}
