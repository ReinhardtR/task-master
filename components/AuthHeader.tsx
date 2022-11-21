import { unstable_getServerSession } from "next-auth";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export async function AuthHeaderSection() {
  const session = await unstable_getServerSession();

  console.log(session); // is always null

  return (
    <>
      {session?.user ? (
        <SignOutButton name={session.user.name!} />
      ) : (
        <SignInButton />
      )}
    </>
  );
}
