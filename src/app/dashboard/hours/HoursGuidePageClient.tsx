"use client";

import React, { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DailyHoursGrid from "./DailyHoursGrid";
import WeeklyHoursSummary from "./WeeklyHoursSummary";
import PayPeriodSummary from "./PayPeriodSummary";
import ShiftEditModal from "./ShiftEditModal";
import AddPunchModal from "./AddPunchModal";
import useMonthlyShifts from "./useMonthlyShifts";
import { Shift, Employee } from "./types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type HoursGuidePageClientProps = {
  employees: Employee[];
};

export default function HoursGuidePageClient({
  employees,
}: HoursGuidePageClientProps) {
  const [view, setView] = useState<"day" | "week" | "pay">("day");
  const [currentDay, setCurrentDay] = useState(new Date());
  const dayLabel = format(currentDay, "EEEE dd MMM yyyy");

  // Charger les données mensuelles via le hook et récupérer mutateReal
  const {
    realShifts: monthlyRealShifts,
    plannedShifts: monthlyPlannedShifts,
    isLoading,
    isError,
    mutateReal,
    // mutatePlanned est supprimé puisqu'il n'est pas utilisé
  } = useMonthlyShifts(currentDay);

  // Filtrer pour obtenir les shifts du jour
  const dayStr = format(currentDay, "yyyy-MM-dd");
  const dailyReal: Shift[] = monthlyRealShifts.filter(
    (s: Shift) => s.dateKey === dayStr
  );
  const dailyPlanned: Shift[] = monthlyPlannedShifts.filter(
    (s: Shift) => s.dateKey === dayStr
  );

  // États pour l'édition et l'ajout
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showAddPunchModal, setShowAddPunchModal] = useState(false);

  // Navigation entre jours
  function handlePrevDay() {
    const newDate = subDays(currentDay, 1);
    setCurrentDay(newDate);
  }
  function handleNextDay() {
    const newDate = addDays(currentDay, 1);
    setCurrentDay(newDate);
  }

  // Callback pour gérer le clic sur un shift
  function handleShiftClick(shift: Shift, _e: React.MouseEvent) {
    console.log("Shift cliqué :", shift);
    setEditingShift(shift);
  }

  async function handleUpdateShift(updated: Shift) {
    console.log("Update shift:", updated);
    try {
      const res = await fetch(`/api/time-records/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startHour: updated.startHour,
          endHour: updated.endHour,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur mise à jour shift");
      }
      await mutateReal();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du shift");
    }
  }

  async function handleDeleteShift(shiftId: string) {
    console.log("Delete shift:", shiftId);
    try {
      const res = await fetch(`/api/time-records/${shiftId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur suppression shift");
      }
      await mutateReal();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du shift");
    }
  }

  useEffect(() => {
    console.log("HoursGuidePageClient - dailyPlanned:", dailyPlanned);
    console.log("HoursGuidePageClient - dailyReal:", dailyReal);
  }, [dailyPlanned, dailyReal]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-4 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Guide des heures</h1>
        <div className="flex items-center gap-4 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
          <Button variant="default" onClick={() => setView("day")}>
            Jour
          </Button>
          <Button variant="default" onClick={() => setView("week")}>
            Semaine
          </Button>
          <Button variant="default" onClick={() => setView("pay")}>
            Période de paie
          </Button>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Vue sélectionnée : </span>
            {view === "day"
              ? "Jour"
              : view === "week"
              ? "Semaine"
              : "Période de paie"}
          </div>
        </div>
      </div>

      {view === "day" && (
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Vue quotidienne - {dayLabel}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handlePrevDay}>
                <ChevronLeft className="w-4 h-4" />
                Jour précédent
              </Button>
              <Button variant="ghost" onClick={handleNextDay}>
                Jour suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="default"
                onClick={() => setShowAddPunchModal(true)}
              >
                Ajouter pointage
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto bg-white">
            {isLoading ? (
              <p>Chargement...</p>
            ) : isError ? (
              <p>Erreur lors du chargement</p>
            ) : (
              <DailyHoursGrid
                employees={employees}
                plannedShifts={dailyPlanned}
                realShifts={dailyReal}
                onShiftClick={(shift, _e) => handleShiftClick(shift, _e)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {view === "week" && (
        <WeeklyHoursSummary
          employees={employees}
          plannedShifts={monthlyPlannedShifts}
          realShifts={monthlyRealShifts}
        />
      )}

      {view === "pay" && (
        <PayPeriodSummary
          employees={employees}
          plannedShifts={monthlyPlannedShifts}
          realShifts={monthlyRealShifts}
        />
      )}

      {editingShift && (
        <ShiftEditModal
          shift={editingShift}
          onClose={() => setEditingShift(null)}
          onUpdate={handleUpdateShift}
          onDelete={handleDeleteShift}
        />
      )}

      {showAddPunchModal && (
        <AddPunchModal
          employees={employees}
          currentDay={currentDay}
          onClose={() => setShowAddPunchModal(false)}
          onAdd={(newShift: Shift) => {
            console.log("Nouveau shift ajouté :", newShift);
            mutateReal();
          }}
        />
      )}
    </div>
  );
}
