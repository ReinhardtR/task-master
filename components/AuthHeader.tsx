import { unstable_getServerSession } from "next-auth";
import { SignInButton } from "./SignInButton";
import { Button } from "./ui/Button";

export async function AuthHeaderSection() {
  const session = await unstable_getServerSession();

  console.log(session);

  return (
    <>
      {session?.user ? (
        <Button variant="ghost">{session.user.name}</Button>
      ) : (
        <SignInButton />
      )}
    </>
  );
}
