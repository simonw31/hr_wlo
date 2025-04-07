import { prisma } from '@/lib/prisma';
import HoursGuidePageClient from './HoursGuidePageClient';
import { parseISO } from 'date-fns';

// Mise à jour des interfaces pour refléter les types réels en DB
interface Amendment {
  startDate: Date;
  endDate?: Date | null;
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
    },
  })) as EmployeeDB[];

  // Pour chaque employé, on sélectionne le premier contrat et on vérifie s'il existe un avenant actif.
  const employees = employeesFromDB.map((emp: EmployeeDB) => {
    const contract = emp.contracts?.[0];
    let contractHours = contract?.hoursPerWeek ?? 0;

    if (contract && contract.amendments && contract.amendments.length > 0) {
      const activeAmendment = contract.amendments.find((amendment: Amendment) => {
        // Ici amendment.startDate est déjà de type Date
        const endDate = amendment.endDate || null;
        return planningDate >= amendment.startDate && (endDate ? planningDate <= endDate : true);
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
