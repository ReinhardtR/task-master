import { useRouter } from "next/router";

export default function TeamPage() {
  const router = useRouter();

  return (
    <div>
      <h1>Team</h1>
      <p>{router.asPath}</p>
    </div>
  );
}
