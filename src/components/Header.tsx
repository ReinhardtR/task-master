import { useSideMenuActions, useSideMenuIsOpen } from "@/lib/sidemenu-store";
import Link from "next/link";
import { AuthHeaderSection } from "./AuthHeader";
import { Button } from "./ui/Button";

export function Header() {
  return (
    <header className="flex justify-center bg-black border-b border-gray-border h-[6vh]">
      <nav className="flex-1 max-w-7xl py-4 flex items-center px-6">
        <Link href="/">
          <p className="text-lg font-medium tracking-wider text-white">
            Task Master
          </p>
        </Link>
        <div className="flex items-center ml-auto space-x-2">
          <AuthHeaderSection />
        </div>
      </nav>
    </header>
  );
}
