"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Users,
  Clock,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Accueil", href: "/dashboard", icon: Home },
  { name: "Mes employés", href: "/dashboard/employees", icon: Users },
  { name: "Guide des heures", href: "/dashboard/hours", icon: Clock },
  { name: "Planning", href: "/dashboard/planning", icon: Calendar },
  { name: "Options", href: "/dashboard/options", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`
        flex h-screen flex-col
        border-r border-gray-200 bg-white
        dark:border-gray-800 dark:bg-gray-900
        transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Partie supérieure : bouton hamburger + profil */}
      <div className="flex flex-col">
        {/* Bouton hamburger, centré horizontalement */}
        <div className="p-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Section Profil */}
        <div className="flex flex-col items-center px-4 pb-6 transition-all duration-300">
          <div className="relative mb-2">
            {/* Avatar plus petit (12×12), icône 6×6 */}
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-900">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            {/* Pastille de présence */}
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
          </div>

          {/* Nom et rôle : masqués si replié */}
          {!isCollapsed && (
            <div className="text-center">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Simon Wlodarczak
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administrateur
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center
                  px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${
                    isCollapsed
                      ? "justify-center" // Centre l'icône quand c'est replié
                      : "justify-between"
                  }
                  ${
                    isActive
                      ? // Lien actif plus visible : fond + bordure à gauche
                        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      : // Hover plus prononcé
                        "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`
                      h-5 w-5
                      ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                      }
                    `}
                  />
                  {/* Masquer le texte si replié */}
                  {!isCollapsed && <span>{item.name}</span>}
                </div>

                {/* Chevron à droite (rotation si actif) */}
                {!isCollapsed && (
                  <ChevronRight
                    className={`
                      h-4 w-4
                      transition-transform duration-200
                      ${
                        isActive
                          ? "rotate-90 text-blue-600 dark:text-blue-400"
                          : "text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400"
                      }
                    `}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bouton Déconnexion (en bas) */}
      <div className="p-4">
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Se déconnecter"}
        </Button>
      </div>
    </div>
  );
}
