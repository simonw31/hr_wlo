"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Search, Clock, TrendingUp } from "lucide-react";
import { Employee, Shift } from "./types";
import { startOfWeek, endOfWeek, addWeeks, format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

type PayPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  salaryMonth: string;
};

type PayPeriodSummaryProps = {
  employees: Employee[];
  realShifts: Shift[];
  plannedShifts?: Shift[];
};

export default function PayPeriodSummary({ employees, realShifts }: PayPeriodSummaryProps) {
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayPeriods();
  }, []);

  async function fetchPayPeriods() {
    try {
      const res = await fetch("/api/pay-periods");
      if (!res.ok) throw new Error("Erreur récupération périodes");
      const data = await res.json();
      setPayPeriods(data);
      if (data.length > 0) {
        setSelectedPeriodId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function getFilteredShifts(shifts: Shift[]) {
    if (!selectedPeriodId) return [];
    const selectedPeriod = payPeriods.find((p) => p.id === selectedPeriodId);
    if (!selectedPeriod) return [];
    const start = new Date(selectedPeriod.startDate);
    const end = new Date(selectedPeriod.endDate);
    return shifts.filter((s) => {
      const shiftDate = new Date(s.dateKey);
      return shiftDate >= start && shiftDate <= end;
    });
  }

  function groupShiftsByWeek(shifts: Shift[], periodStart: Date, periodEnd: Date) {
    const weeks: { weekStart: Date; weekEnd: Date; weekShifts: Shift[] }[] = [];
    let current = startOfWeek(periodStart, { weekStartsOn: 1 });
    while (current <= periodEnd) {
      const weekStart = current;
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
      const weekShifts = shifts.filter((s) => {
        const shiftDate = new Date(s.dateKey);
        return (
          shiftDate >= weekStart &&
          shiftDate <= weekEnd &&
          shiftDate >= periodStart &&
          shiftDate <= periodEnd
        );
      });
      weeks.push({ weekStart, weekEnd, weekShifts });
      current = addWeeks(current, 1);
    }
    return weeks;
  }

  // Calcul des heures supp pour une semaine en fonction du seuil hebdomadaire
  function getOvertimeHoursForWeek(weekRealHours: number, weeklyThreshold: number) {
    const overtime = Math.max(0, weekRealHours - weeklyThreshold);
    return {
      overtime10: Math.min(4, overtime),
      overtime25: Math.min(4, Math.max(0, overtime - 4)),
      overtime50: Math.max(0, overtime - 8),
    };
  }

  // Calcul de la paie d'un employé en intégrant la logique d'avenants
  function calculateEmployeePay(emp: Employee) {
    // Utilisation du contrat d'origine : si emp.contract est présent, sinon on se base sur emp.contractHours
    const originalWeeklyContract = emp.contract ? emp.contract.hoursPerWeek : emp.contractHours;

    // Base mensuelle de référence (contrat d'origine) : 4.33 semaines par mois
    const baseMonthlyOriginal = originalWeeklyContract * 4.33;

    // Période de paie sélectionnée
    const selectedPeriod = payPeriods.find((p) => p.id === selectedPeriodId);
    if (!selectedPeriod) {
      return {
        baseMonthlyOriginal,
        amendmentsAdjustment: 0,
        baseHours: baseMonthlyOriginal,
        totalOvertime10: 0,
        totalOvertime25: 0,
        totalOvertime50: 0,
      };
    }

    const periodStart = new Date(selectedPeriod.startDate);
    const periodEnd = new Date(selectedPeriod.endDate);

    // 1) Calcul de la somme des heures ajoutées (ou retirées) par les avenants sur la période
    let amendmentsAdjustment = 0;
    if (emp.contract && emp.contract.amendments && emp.contract.amendments.length > 0) {
      for (const amendment of emp.contract.amendments) {
        const amendmentStart = new Date(amendment.startDate);
        // Si aucune date de fin, on considère que l'avenant s'étend jusqu'à la fin de la période
        const amendmentEnd = amendment.endDate ? new Date(amendment.endDate) : periodEnd;

        // Calcul de l'intervalle de chevauchement entre la période de paie et l'avenant
        const overlapStart = amendmentStart < periodStart ? periodStart : amendmentStart;
        const overlapEnd = amendmentEnd > periodEnd ? periodEnd : amendmentEnd;

        if (overlapStart < overlapEnd && amendment.newHoursPerWeek !== null) {
          const daysOverlap = differenceInDays(overlapEnd, overlapStart) + 1;
          const weeksOverlap = daysOverlap / 7;
          // Ex: si l'avenant est +5h/semaine par rapport au contrat, on ajoute +5 * weeksOverlap
          amendmentsAdjustment += (amendment.newHoursPerWeek - originalWeeklyContract) * weeksOverlap;
        }
      }
    }

    // Base réelle (contrat + avenants)
    const baseHours = baseMonthlyOriginal + amendmentsAdjustment;

    // 2) Calcul des heures supp semaine par semaine (car le seuil peut changer si un avenant est actif)
    let totalOvertime10 = 0;
    let totalOvertime25 = 0;
    let totalOvertime50 = 0;
    const filteredShifts = getFilteredShifts(realShifts);

    if (filteredShifts.length > 0) {
      const weeks = groupShiftsByWeek(filteredShifts, periodStart, periodEnd);
      for (const { weekShifts, weekStart } of weeks) {
        // Seuil hebdo par défaut = contrat d'origine
        let weeklyThreshold = originalWeeklyContract;

        // Si un avenant est actif pour la semaine, on applique son newHoursPerWeek
        if (emp.contract && emp.contract.amendments) {
          for (const amendment of emp.contract.amendments) {
            const amendmentStart = new Date(amendment.startDate);
            const amendmentEnd = amendment.endDate ? new Date(amendment.endDate) : periodEnd;
            if (
              amendment.newHoursPerWeek !== null &&
              weekStart >= amendmentStart &&
              weekStart <= amendmentEnd
            ) {
              weeklyThreshold = amendment.newHoursPerWeek;
              break;
            }
          }
        }

        // Calcul des heures réelles de la semaine
        const weekRealHours = weekShifts
          .filter((s) => s.employeeId === emp.id)
          .reduce((acc, s) => acc + (s.endHour - s.startHour), 0);

        // Calcul des heures supp
        const overtime = getOvertimeHoursForWeek(weekRealHours, weeklyThreshold);
        totalOvertime10 += overtime.overtime10;
        totalOvertime25 += overtime.overtime25;
        totalOvertime50 += overtime.overtime50;
      }
    }

    return {
      baseMonthlyOriginal,
      amendmentsAdjustment,
      baseHours, // baseMonthlyOriginal + amendmentsAdjustment
      totalOvertime10,
      totalOvertime25,
      totalOvertime50,
    };
  }

  function handleExport() {
    if (!selectedPeriodId) return;
    const url = `/api/export/payVariables?payPeriodId=${selectedPeriodId}`;
    window.location.href = url;
  }

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPeriod = payPeriods.find((p) => p.id === selectedPeriodId);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-white">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              {selectedPeriod ? `Période de paie - ${selectedPeriod.salaryMonth}` : "Période de paie"}
            </CardTitle>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                className="border-none bg-transparent focus:outline-none text-sm"
                value={selectedPeriodId || ""}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
              >
                {payPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {format(new Date(period.startDate), "dd MMM", { locale: fr })} -{" "}
                    {format(new Date(period.endDate), " dd MMM yyyy", { locale: fr })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-auto p-6">
        <div className="grid gap-4">
          {filteredEmployees.map((emp) => {
            const {
              baseMonthlyOriginal,
              amendmentsAdjustment,
              baseHours,
              totalOvertime10,
              totalOvertime25,
              totalOvertime50,
            } = calculateEmployeePay(emp);

            // Total final = base + heures sup
            const totalHours = baseHours + totalOvertime10 + totalOvertime25 + totalOvertime50;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md animate-fadeIn"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={emp.photoUrl || "/images/profile.jpg"}
                        alt={emp.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{emp.baseContractHours}h contractuelles</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-semibold text-blue-600">
                      {totalHours.toFixed(1)}h
                    </span>
                  </div>
                </div>

                {/* 
                  Ici, on affiche la base contractuelle + la partie avenant si > 0 (ou < 0 si l'avenant réduit les heures)
                  Ensuite, les colonnes pour les heures sup.
                */}
                <div
                  className={
                    // Si on veut 5 colonnes si on affiche l'avenant, sinon 4
                    amendmentsAdjustment !== 0
                      ? "grid grid-cols-5 gap-4"
                      : "grid grid-cols-4 gap-4"
                  }
                >
                  {/* Base contractuelle */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Base</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {baseMonthlyOriginal.toFixed(1)}h
                    </div>
                  </div>

                  {/* Avenant (affiché uniquement si != 0) */}
                  {amendmentsAdjustment !== 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700">Avenant</div>
                      <div className="mt-1 text-lg font-semibold text-blue-800">
                        {/* On affiche +Xh ou -Xh selon le signe */}
                        {amendmentsAdjustment > 0
                          ? `+${amendmentsAdjustment.toFixed(1)}h`
                          : `${amendmentsAdjustment.toFixed(1)}h`}
                      </div>
                    </div>
                  )}

                  {/* Heures sup 10% */}
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-700">+10%</div>
                    <div className="mt-1 text-lg font-semibold text-yellow-800">
                      {totalOvertime10.toFixed(1)}h
                    </div>
                  </div>

                  {/* Heures sup 25% */}
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-sm font-medium text-orange-700">+25%</div>
                    <div className="mt-1 text-lg font-semibold text-orange-800">
                      {totalOvertime25.toFixed(1)}h
                    </div>
                  </div>

                  {/* Heures sup 50% */}
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-700">+50%</div>
                    <div className="mt-1 text-lg font-semibold text-red-800">
                      {totalOvertime50.toFixed(1)}h
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
