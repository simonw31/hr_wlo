// src/app/dashboard/planning/editor/utils.ts
import { Employee, Shift } from "./types";
import { addDays, startOfWeek, format } from "date-fns";

/**
 * Retourne le nom complet de l'employé, ou "Inconnu" s'il n'existe pas.
 */
export function getEmployeeName(employees: Employee[], empId: string): string {
  const emp = employees.find((e) => e.id === empId);
  return emp ? `${emp.firstName} ${emp.lastName}` : "Inconnu";
}

/**
 * Calcule le total d'heures planifiées pour un employé donné
 * sur la semaine du `currentDateKey`.
 */
export function getEmployeeWeekHours(
  empId: string,
  shiftsByDate: Record<string, Shift[]>,
  currentDateKey: string
): number {
  // Convertir currentDateKey (ex: "2025-03-31") en objet Date
  const [yyyy, mm, dd] = currentDateKey.split("-");
  const dateObj = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));

  // Déterminer le lundi de la semaine
  const monday = startOfWeek(dateObj, { weekStartsOn: 1 });

  let total = 0;
  // Parcourir les 7 jours de la semaine (lundi -> dimanche)
  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i);
    const dk = format(day, "yyyy-MM-dd");
    const dayShifts = shiftsByDate[dk] || [];

    // Ajouter la somme des heures du jour pour l'employé empId
    total += dayShifts
      .filter((s) => s.employeeId === empId)
      .reduce((sum, s) => sum + (s.endHour - s.startHour), 0);
  }
  return total;
}
