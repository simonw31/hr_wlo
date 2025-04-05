// src/app/dashboard/layout.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
          {/* Titre à gauche */}
          <h1 className="text-2xl font-bold">Dashboard</h1>

          {/* Barre de recherche + icône notifications à droite */}
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
