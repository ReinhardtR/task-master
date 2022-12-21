import { SideBar } from "./layout/SideBar";

type Props = {
  children: React.ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <div className="bg-gray-2 flex h-screen">
      <SideBar />
      <div className="max-w-7xl mx-auto flex-1 py-16 px-8">{children}</div>
    </div>
  );
}
