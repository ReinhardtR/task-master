import { AuthHeaderSection } from "./AuthHeader";

export async function Header() {
  return (
    <header className="flex justify-center bg-black">
      <nav className="flex-1 max-w-7xl py-4 flex items-center px-6">
        <p className="text-lg font-medium tracking-wider text-white">
          Task Master
        </p>
        <div className="flex items-center ml-auto space-x-2">
          {/* @ts-expect-error */}
          <AuthHeaderSection />
        </div>
      </nav>
    </header>
  );
}
