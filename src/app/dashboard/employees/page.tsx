"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  ArrowLeft,
  ArrowRight,
  User,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Contrat
type ContractType = {
  id: string;
  role: string | null;
  contractType: string | null;
  hoursPerWeek?: number | null;
};

// Employé
type EmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  // Désormais un tableau
  contracts?: ContractType[];
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

function getRoleBadgeVariant(role: string | null): BadgeVariant {
  if (!role || role === "Aucun rôle") return "secondary";
  const lower = role.toLowerCase();
  if (lower.includes("responsable")) return "default";
  if (lower.includes("manager")) return "destructive";
  return "outline";
}

function getContractTypeBadgeVariant(type: string | null): BadgeVariant {
  if (!type || type === "Sans contrat") return "secondary";
  const lower = type.toLowerCase();
  if (lower.includes("cdi")) return "outline";
  if (lower.includes("cdd")) return "default";
  return "outline";
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        } else {
          console.error("Erreur lors de la récupération des employés");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleDeleteSelected() {
    console.log("Supprimer :", selectedIds);
    // Faire ici votre appel API pour supprimer
  }

  return (
    <Card className="shadow">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-xl font-semibold">Mes employés</CardTitle>
        <div className="flex items-center gap-2">
          {selectedIds.length >= 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDeleteSelected}>
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Link href="/dashboard/employees/new">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nouveau salarié
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 items-center py-2 px-2 text-sm font-medium text-gray-600 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="w-4" />
            <span>Nom</span>
          </div>
          <div className="pl-2 border-l border-gray-200">Rôle</div>
          <div className="pl-2 border-l border-gray-200">Contrat</div>
          <div className="pl-2 border-l border-gray-200">Heures</div>
        </div>

        <div className="divide-y divide-gray-200">
          {employees.map((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`.trim();
            const isSelected = selectedIds.includes(emp.id);

            // Sélection du premier contrat
            const firstContract = emp.contracts?.[0];
            const role = firstContract?.role || "Aucun rôle";
            const contractType = firstContract?.contractType || "Sans contrat";
            const hours = firstContract?.hoursPerWeek
              ? `${firstContract.hoursPerWeek}h`
              : "-";

            return (
              <div
                key={emp.id}
                className="grid grid-cols-4 items-center py-3 px-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(emp.id)}
                    className="h-4 w-4 accent-blue-500"
                  />
                  <Avatar>
                    <AvatarImage src={emp.photoUrl ?? ""} alt={fullName} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/dashboard/employees/${emp.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-gray-800 dark:text-gray-100 hover:underline"
                  >
                    {fullName || "Nom inconnu"}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </div>

                {/* Col 2 : rôle */}
                <div className="pl-2 border-l border-gray-200">
                  <Badge variant={getRoleBadgeVariant(role)}>
                    {role}
                  </Badge>
                </div>

                {/* Col 3 : type de contrat */}
                <div className="pl-2 border-l border-gray-200">
                  <Badge variant={getContractTypeBadgeVariant(contractType)}>
                    {contractType}
                  </Badge>
                </div>

                {/* Col 4 : heures */}
                <div className="pl-2 border-l border-gray-200">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {hours}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination basique */}
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button variant="ghost" size="sm">
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
