export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { prisma } from "@/lib/prisma";
import { format, startOfWeek, endOfWeek } from "date-fns";
import PlanningEditorPageClient from "../PlanningEditorPageClient";
import { Employee, Shift } from "../types";

// Types pour vos données
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

// Ici, on définit PageProps en indiquant que params est une promesse qui se résout en { day: string }
interface PageProps {
  params: Promise<{ day: string }>;
}

export default async function EditorPage({ params }: PageProps) {
  // Attendre la résolution de params pour obtenir l'objet { day: string }
  const { day } = await params;
  const dayDate = new Date(day);
  if (isNaN(dayDate.getTime())) {
    return <div>Date invalide : {day}</div>;
  }

  // Récupérer le DayLock pour la date donnée
  const dayLock = await prisma.dayLock.findUnique({
    where: { date: dayDate },
  });
  const initialIsLocked = dayLock?.locked ?? false;

  // Récupérer les employés avec leurs contrats, disponibilités et avenants
  const employeesFromDB = await prisma.employee.findMany({
    include: {
      contracts: {
        include: {
          availability: true,
          amendments: true,
        },
      },
    },
  });

  const employees = (employeesFromDB as EmployeeWithContracts[]).map((emp) => {
    const contract = emp.contracts?.[0];
    let contractHours = contract?.hoursPerWeek ?? 0;
    if (contract && contract.amendments && contract.amendments.length > 0) {
      const activeAmendment = contract.amendments.find((amendment: Amendment) => {
        const startDate = new Date(amendment.startDate);
        const endDate = amendment.endDate ? new Date(amendment.endDate) : null;
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
          day: a.day as "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche",
          allDay: a.allDay,
          startTime: a.startTime || undefined,
          endTime: a.endTime || undefined,
        })) ?? [],
    };
  });

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

  const shiftsByDate: Record<string, Shift[]> = {};
  for (const shift of shiftsFromDB) {
    const dk = format(shift.date, "yyyy-MM-dd");
    if (!shiftsByDate[dk]) {
      shiftsByDate[dk] = [];
    }
    shiftsByDate[dk].push({
      id: shift.id,
      employeeId: shift.employeeId,
      employeeName: "", // sera rempli côté client
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
