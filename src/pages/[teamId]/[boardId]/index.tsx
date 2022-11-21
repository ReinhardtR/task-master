import { Header } from "@/components/Header";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";

const columns = [
  {
    name: "Todo",
    color: "#14AAF5",
    tasks: [
      {
        name: "Create a new team",
      },
    ],
  },
  {
    name: "In Progress",
    color: "#F5B14A",
    tasks: [
      {
        name: "Create a new team",
      },
      {
        name: "Create a new user",
      },
      {
        name: "Create a new user",
      },
    ],
  },
  {
    name: "Done",
    color: "#F5145A",
    tasks: [
      {
        name: "Create a new board",
      },
      {
        name: "Create a new task",
      },
      {
        name: "Create a new team",
      },
      {
        name: "Create a new user",
      },
      {
        name: "Create a new user",
      },
    ],
  },
];

export default function BoardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-grow">
      {columns.map((column) => (
        <div className="flex flex-col h-full">
          <div
            className="flex px-8 items-center text-white text-xl font-bold w-80 h-16"
            style={{ backgroundColor: column.color }}
          >
            {column.name}
          </div>
          <div className="flex-1 flex flex-col space-y-2 p-2">
            {column.tasks.map((task) => (
              <div className="w-full p-4 bg-black border border-gray-border rounded-lg text-white min-h-[100px] shadow font-medium">
                {task.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
