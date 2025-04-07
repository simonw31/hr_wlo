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

// On déclare explicitement que params est une promesse résolvant un objet { id: string }
export default async function EmployeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Attendre la résolution de params pour obtenir l'objet { id: string }
  const { id } = await params;
  
  // Récupérer l'employé avec ses contrats
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      contracts: {
        include: {
          availability: true,
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
    availabilities:
      firstContract?.availability.map((avail: AvailabilityInterval) => ({
        id: avail.id,
        day: avail.day,
        allDay: avail.allDay,
        startTime: avail.startTime ?? "",
        endTime: avail.endTime ?? "",
      })) || [],
  };

  return <EmployeeEditForm employee={editEmployee} />;
}
