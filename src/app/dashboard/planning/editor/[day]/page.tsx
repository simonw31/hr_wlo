import { prisma } from "@/lib/prisma";
import { format, startOfWeek, endOfWeek } from "date-fns";
import PlanningEditorPageClient from "../PlanningEditorPageClient";
import { Employee, Shift } from "../types";

interface Amendment {
  startDate: string;
  endDate?: string | null;
  newHoursPerWeek: number | null;
}

interface Availability {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface EmployeeWithContracts extends Employee {
  contracts?: {
    hoursPerWeek: number | null;
    availability: Availability[];
    amendments: Amendment[];
  }[];
}

interface PageProps {
  params: { day: string };
}

export default async function EditorPage({ params }: PageProps) {
  const dayDate = new Date(params.day);
  if (isNaN(dayDate.getTime())) {
    return <div>Date invalide : {params.day}</div>;
  }

  // Récupérer le DayLock pour la date donnée
  const dayLock = await prisma.dayLock.findUnique({
    where: { date: dayDate },
  });
  // Si aucune entrée en BDD, c'est déverrouillé par défaut
  const initialIsLocked = dayLock?.locked ?? false;

  // Récupérer les employés avec leurs contrats, disponibilités et avenants
  const employeesFromDB = await prisma.employee.findMany({
    include: {
      contracts: {
        include: {
          availability: true,
          amendments: true, // Inclusion des avenants
        },
      },
    },
  });

  // On cast les employés en EmployeeWithContracts pour avoir accès à "contracts"
  const employees = (employeesFromDB as EmployeeWithContracts[]).map((emp) => {
    const contract = emp.contracts?.[0];
    // Par défaut, utiliser les heures du contrat de base
    let contractHours = contract?.hoursPerWeek ?? 0;

    if (contract && contract.amendments && contract.amendments.length > 0) {
      const activeAmendment = contract.amendments.find((amendment: Amendment) => {
        const startDate = new Date(amendment.startDate);
        const endDate = amendment.endDate ? new Date(amendment.endDate) : null;
        // L'avenant est actif si la date planifiée est entre startDate et endDate (ou sans fin définie)
        return dayDate >= startDate && (endDate ? dayDate <= endDate : true);
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
      availability:
        contract?.availability?.map((a: Availability) => ({
          id: a.id,
          // Conversion explicite en union de chaînes littérales
          day: a.day as "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche",
          allDay: a.allDay,
          startTime: a.startTime || undefined,
          endTime: a.endTime || undefined,
        })) ?? [],
    };
  });

  // Charger tous les shifts pour la semaine (lundi -> dimanche)
  const weekStart = startOfWeek(dayDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(dayDate, { weekStartsOn: 1 });
  const shiftsFromDB = await prisma.shift.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Construire un objet regroupant les shifts par dateKey (format "yyyy-MM-dd")
  const shiftsByDate: Record<string, Shift[]> = {};
  for (const shift of shiftsFromDB) {
    const dk = format(shift.date, "yyyy-MM-dd");
    if (!shiftsByDate[dk]) {
      shiftsByDate[dk] = [];
    }
    shiftsByDate[dk].push({
      id: shift.id,
      employeeId: shift.employeeId,
      employeeName: "", // à remplir côté client
      startHour: shift.startHour,
      endHour: shift.endHour,
      dateKey: dk,
      shiftType: shift.shiftType || "Salle",
    });
  }

  return (
    <PlanningEditorPageClient
      employees={employees}
      initialShiftsByDate={shiftsByDate}
      initialDate={dayDate}
      initialIsLocked={initialIsLocked}
    />
  );
}
