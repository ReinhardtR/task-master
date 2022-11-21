"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/Button";

type Props = {
  name: string;
};

export function SignOutButton({ name }: Props) {
  const onSignOut = () => {
    signOut();
  };

  return (
    <Button variant="ghost" onClick={onSignOut}>
      {name}
    </Button>
  );
}
