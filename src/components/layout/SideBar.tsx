import { useSideMenuActions, useSideMenuIsOpen } from "@/lib/sidemenu-store";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/Button";

const items = ["Home", "About", "Contact", "Services"];

export function SideBar() {
  const isOpen = useSideMenuIsOpen();
  const { toggle } = useSideMenuActions();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ marginLeft: -320 }}
          animate={{ marginLeft: 0 }}
          exit={{ marginLeft: -320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-gray-1 h-screen border-r border-gray-6 p-16 w-full sm:w-[320px]"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <p>John Doe</p>
              <Button variant="ghost">{"<<"}</Button>
            </div>
            <div className="flex flex-col space-y-4">
              {items.map((item) => (
                <a key={item} href="/">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
