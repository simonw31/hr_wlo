// src/app/dashboard/layout.tsx
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";
import NotificationsMenu from "@/components/NotificationsMenu";
import { Toaster } from "react-hot-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <IntelligentSearchBar />
            <NotificationsMenu />
          </div>
          <Toaster />
        </header>
        {children}
      </main>
    </div>
  );
}
