import { CreateTeamAction } from "@/components/teams/CreateTeamAction";
import { Layout } from "@/components/Layout";
import { TeamsOverview } from "@/components/teams/TeamsOverview";
import { useSideMenuActions } from "@/lib/sidemenu-store";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/SignOutButton";
import { SignInButton } from "@/components/SignInButton";
import { useSession } from "next-auth/react";

export default function Home() {
  const { toggle } = useSideMenuActions();
  const session = useSession();

  return (
    <Layout>
      {session.status === "authenticated" ? (
        <SignOutButton name={session.data.user?.name!} />
      ) : (
        <SignInButton />
      )}
      <Button onClick={toggle}>Toggle SideMenu</Button>
      <CreateTeamAction />
      <TeamsOverview />
    </Layout>
  );
}
