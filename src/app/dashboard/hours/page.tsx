import { prisma } from '@/lib/prisma';
import HoursGuidePageClient from './HoursGuidePageClient';

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
  // Suppression de timeRecords car non utilisé et pour éviter le type any
}

export default async function HoursGuidePage() {
  const planningDate = new Date();

  // On inclut `contracts` avec leurs avenants
  const employeesFromDB = (await prisma.employee.findMany({
    include: {
      contracts: {
        include: {
          amendments: true,
        },
      },
      // timeRecords: true, // Retiré s'il n'est pas nécessaire
    },
  })) as EmployeeDB[];

  // Pour chaque employé, on sélectionne le premier contrat et on vérifie s'il existe un avenant actif.
  const employees = employeesFromDB.map((emp: EmployeeDB) => {
    const contract = emp.contracts?.[0];
    let contractHours = contract?.hoursPerWeek ?? 0;

    if (contract && contract.amendments && contract.amendments.length > 0) {
      const activeAmendment = contract.amendments.find((amendment: Amendment) => {
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
      baseContractHours: contract?.hoursPerWeek ?? 0,
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
