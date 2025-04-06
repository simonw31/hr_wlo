// /app/dashboard/employees/[id]/edit/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EmployeeEditForm from "../EmployeeEditForm";

interface AvailabilityInterval {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

export default async function EmployeeEditPage({ params }: { params: { id: string } }) {
  // Extraction de l'ID de l'employé depuis le contexte
  const id = params.id;

  // Récupérer l'employé avec ses contrats (notez l'utilisation de "contracts" au pluriel)
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      contracts: {
        include: {
          availability: true, // Récupère les disponibilités depuis chaque contrat
        },
      },
    },
  });

  if (!employee) {
    notFound();
  }

  // Sélectionner le premier contrat (celui qui sera affiché dans l'édition)
  const firstContract = employee.contracts?.[0];

  // Préparer l'objet pour EmployeeEditForm
  const editEmployee = {
    ...employee,
    dateOfBirth: employee.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
      : "",
    // On ajoute une propriété "availabilities" à partir du premier contrat
    availabilities:
      firstContract?.availability.map((avail: AvailabilityInterval) => ({
        id: avail.id,
        day: avail.day,
        allDay: avail.allDay,
        startTime: avail.startTime ?? "",
        endTime: avail.endTime ?? "",
      })) || [],
    // Vous pouvez ajouter ici d'autres informations du contrat si nécessaire
  };

  return <EmployeeEditForm employee={editEmployee} />;
}
