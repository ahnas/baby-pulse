// app/routes/index.tsx
import { MetaFunction } from "@remix-run/node";
import Navbar from "~/components/Navbar";

export const meta: MetaFunction = () => {
  return [
    { title: "Baby Pulse" },
    { name: "description", content: "Welcome to Baby Pulse!" },
  ];
};

export default function Index() {
  return (
    <div className={`min-h-screen`}>
      <Navbar />
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-16">
          <h1 className="text-3xl font-bold">Welcome to Baby Pulse!</h1>
          <p className="text-lg">Your go-to app for monitoring baby's health.</p>
        </div>
      </div>
    </div>
  );
}
