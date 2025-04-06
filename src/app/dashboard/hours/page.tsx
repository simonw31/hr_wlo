import React from "react";
import { prisma } from "@/lib/prisma";
import HoursGuidePageClient from "./HoursGuidePageClient";

// Définition des types pour les données issues de la BDD
interface Amendment {
  startDate: string;
  endDate?: string | null;
  newHoursPerWeek: number | null;
}

interface Contract {
  hoursPerWeek: number | null;
  amendments?: Amendment[];
}

interface EmployeeDB {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  contracts?: Contract[];
  timeRecords?: any[];
}

export default async function HoursGuidePage() {
  const planningDate = new Date();

  // On inclut `contracts` avec leurs avenants ainsi que timeRecords
  const employeesFromDB = (await prisma.employee.findMany({
    include: {
      contracts: {
        include: {
          amendments: true,
        },
      },
      timeRecords: true,
    },
  })) as EmployeeDB[];

  // Pour chaque employé, on sélectionne le premier contrat et on vérifie s'il existe un avenant actif.
  const employees = employeesFromDB.map((emp: EmployeeDB) => {
    const firstContract = emp.contracts?.[0];
    let contractHours = firstContract?.hoursPerWeek ?? 0;

    if (firstContract && firstContract.amendments && firstContract.amendments.length > 0) {
      const activeAmendment = firstContract.amendments.find((amendment: Amendment) => {
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
