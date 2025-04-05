// /app/dashboard/hours/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import HoursGuidePageClient from "./HoursGuidePageClient";

export default async function HoursGuidePage() {
  const planningDate = new Date();

  // On inclut `contracts` avec leurs avenants ainsi que timeRecords
  const employeesFromDB = await prisma.employee.findMany({
    include: {
      contracts: {
        include: {
          amendments: true,
        },
      },
      timeRecords: true,
    },
  });

  // Pour chaque employé, on sélectionne le premier contrat et on vérifie si un avenant actif existe.
  const employees = employeesFromDB.map((emp) => {
    const firstContract = emp.contracts?.[0];
    let contractHours = firstContract?.hoursPerWeek ?? 0;

    if (firstContract && firstContract.amendments && firstContract.amendments.length > 0) {
      const activeAmendment = firstContract.amendments.find((amendment) => {
        const startDate = new Date(amendment.startDate);
        const endDate = amendment.endDate ? new Date(amendment.endDate) : null;
        // L'avenant est actif si la date de planification est entre startDate et endDate (ou sans fin définie)
        return planningDate >= startDate && (endDate ? planningDate <= endDate : true);
      });
      if (activeAmendment && activeAmendment.newHoursPerWeek !== null) {
        contractHours = activeAmendment.newHoursPerWeek;
      }
    }

    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      baseContractHours: firstContract?.hoursPerWeek ?? 0, // Base du contrat
      photoUrl: emp.photoUrl ?? undefined,
      contractHours,
    };
  });

  return (
    <HoursGuidePageClient
      employees={employees}
    />
  );
}
