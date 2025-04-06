import { prisma } from '@/lib/prisma';
import PlanningEditorPageClient from './PlanningEditorPageClient';

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
  contracts?: Contract[];
}

export default async function PlanningEditorPage() {
  const planningDate = new Date();

  // Récupérer les employés avec leurs contrats et avenants
  const employeesFromDB = (await prisma.employee.findMany({
    include: { 
      contracts: {
        include: {
          amendments: true,
        },
      },
    },
  })) as EmployeeDB[];

  // Construire la structure attendue par le composant client
  const employees = employeesFromDB.map((emp: EmployeeDB) => {
    // Sélectionner le premier contrat
    const contract = emp.contracts?.[0];
    // Par défaut, utiliser les heures du contrat de base
    let contractHours = contract?.hoursPerWeek ?? 0;

    if (contract && contract.amendments && contract.amendments.length > 0) {
      // Vérifier s'il existe un avenant actif pour la période planifiée
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
      firstName: emp.firstName,
      lastName: emp.lastName,
      contractHours,
    };
  });

  return (
    <PlanningEditorPageClient 
      employees={employees} 
      initialShiftsByDate={{}} // Aucun shift de planification initial
      initialDate={planningDate} 
      initialIsLocked={false} 
    />
  );
}
