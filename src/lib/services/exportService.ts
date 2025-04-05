// lib/services/exportService.ts
import { prisma } from "@/lib/prisma";
import { format, startOfWeek, endOfWeek, addWeeks } from "date-fns";

// Interface pour le résultat de l'export
interface PayVariables {
  employeeId: string;
  firstName: string;
  lastName: string;
  baseContract: number;
  pointedHours: number;
  // Une cellule par semaine sera générée dans le CSV
  weeklyDetails: string[];
}

/**
 * Génère le CSV des variables de paie pour un pay period donné.
 * Le CSV comporte les colonnes :
 * - Nom, Prénom, Base Contrat (contrat hebdomadaire * 4.33), Heures Pointées (total sur la période)
 * - Une colonne par semaine de la période de paie, contenant :
 *    "Théorique: Xh, Réel: Yh, Supp: A/B/C"
 *    où X = seuil théorique (issu d'un avenant s'il est actif, sinon base du contrat),
 *          Y = nombre d'heures réellement pointées pendant la semaine,
 *          A/B/C = heures supp réparties en 10%/25%/50%
 */
export async function generatePayVariablesCSV(payPeriodId: string): Promise<string> {
  // 1. Récupérer la période de paie
  const payPeriod = await prisma.payPeriod.findUnique({
    where: { id: payPeriodId },
  });
  if (!payPeriod) {
    throw new Error("Pay period not found");
  }
  const periodStart = new Date(payPeriod.startDate);
  const periodEnd = new Date(payPeriod.endDate);

  // 2. Récupérer les employés avec leur contrat et avenants
  const employees = await prisma.employee.findMany({
    include: {
      contracts: { include: { amendments: true } },
    },
  });

  // 3. Récupérer tous les shifts de la période
  const shifts = await prisma.shift.findMany({
    where: {
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  // Regrouper les shifts par employé
  const shiftsByEmployee: Record<string, Array<{ startHour: number; endHour: number; date: Date }>> = {};
  for (const shift of shifts) {
    if (!shiftsByEmployee[shift.employeeId]) {
      shiftsByEmployee[shift.employeeId] = [];
    }
    shiftsByEmployee[shift.employeeId].push({
      startHour: shift.startHour,
      endHour: shift.endHour,
      date: new Date(shift.date),
    });
  }

  // Fonction qui retourne toutes les semaines (définies par leur lundi et dimanche) pour une période donnée
  function getWeeksInPeriod(periodStart: Date, periodEnd: Date): { weekStart: Date; weekEnd: Date }[] {
    const weeks = [];
    let current = startOfWeek(periodStart, { weekStartsOn: 1 });
    while (current <= periodEnd) {
      const weekStart = current;
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
      weeks.push({ weekStart, weekEnd });
      current = addWeeks(current, 1);
    }
    return weeks;
  }

  // Calcul des heures supplémentaires pour une semaine selon un seuil donné
  function calculateOvertime(weekShifts: Array<{ startHour: number; endHour: number; date: Date }>, threshold: number) {
    const actualHours = weekShifts.reduce((acc, s) => acc + (s.endHour - s.startHour), 0);
    const overtime = Math.max(0, actualHours - threshold);
    const overtime10 = Math.min(4, overtime);
    const overtime25 = Math.min(4, Math.max(0, overtime - 4));
    const overtime50 = Math.max(0, overtime - 8);
    return { actualHours, overtime10, overtime25, overtime50 };
  }

  // Calculer les semaines couvrant la période de paie
  const weeks = getWeeksInPeriod(periodStart, periodEnd);

  // 4. Calculer pour chaque employé les variables de paie
  const results: PayVariables[] = [];
  for (const emp of employees) {
    // On utilise le premier contrat pour l'employé
    if (!emp.contracts || emp.contracts.length === 0) continue;
    const contract = emp.contracts[0];
    const originalWeeklyContract = contract.hoursPerWeek ?? 0;
    const baseContract = originalWeeklyContract * 4.33; // Base mensuelle du contrat d'origine

    // Total des heures pointées dans la période pour l'employé
    const empShifts = shiftsByEmployee[emp.id] || [];
    const pointedHours = empShifts.reduce((acc, s) => acc + (s.endHour - s.startHour), 0);

    // Pour chaque semaine de la période, calculer les infos de paie
    const weeklyDetails: string[] = [];
    for (const { weekStart, weekEnd } of weeks) {
      // Filtrer les shifts de l'employé pour la semaine
      const weekShifts = empShifts.filter(s => s.date >= weekStart && s.date <= weekEnd);
      
      // Déterminer le seuil théorique pour la semaine
      let threshold = originalWeeklyContract;
      let label = "Standard";
      if (contract.amendments && contract.amendments.length > 0) {
        for (const amendment of contract.amendments) {
          const amendmentStart = new Date(amendment.startDate);
          const amendmentEnd = amendment.endDate ? new Date(amendment.endDate) : periodEnd;
          if (amendment.newHoursPerWeek !== null && weekStart >= amendmentStart && weekStart <= amendmentEnd) {
            threshold = amendment.newHoursPerWeek;
            label = "Avenant";
            break;
          }
        }
      }

      // Calculer les heures réelles et les heures supp pour la semaine
      const { actualHours, overtime10, overtime25, overtime50 } = calculateOvertime(weekShifts, threshold);
      // Format de la cellule pour la semaine
      const cell = `Théorique: ${threshold.toFixed(1)}h, Réel: ${actualHours.toFixed(1)}h, Supp: ${overtime10.toFixed(1)}/${overtime25.toFixed(1)}/${overtime50.toFixed(1)} (${label})`;
      weeklyDetails.push(cell);
    }

    results.push({
      employeeId: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      baseContract,
      pointedHours,
      weeklyDetails,
    });
  }

  // 5. Générer le contenu CSV
  // Colonnes de base
  const headerColumns = ["Nom", "Prénom", "Base Contrat", "Heures Pointées"];
  // Ajouter une colonne par semaine (en utilisant le label [dd/MM - dd/MM])
  const weekHeaders = weeks.map(({ weekStart, weekEnd }) =>
    `[${format(weekStart, "dd/MM")}-${format(weekEnd, "dd/MM")}]`
  );
  const header = [...headerColumns, ...weekHeaders].join(",");

  // Générer une ligne par employé
  const rows = results.map((r) => {
    // Les colonnes de base
    const baseCols = [
      r.lastName,
      r.firstName,
      r.baseContract.toFixed(2),
      r.pointedHours.toFixed(2),
    ];
    // Pour chaque semaine, encapsuler le contenu entre guillemets (s'il contient des virgules)
    const weekCols = r.weeklyDetails.map(detail => `"${detail}"`);
    return [...baseCols, ...weekCols].join(",");
  });

  const csvContent = [header, ...rows].join("\n");
  return csvContent;
}
