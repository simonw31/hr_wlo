"use client";

import { useState, useEffect, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import WeeklyForecastBlock from "./WeeklyForecastBlock";

type WeekStatus = "confirmed" | "editing" | "none";

const statusColors: Record<WeekStatus, string> = {
  confirmed: "bg-green-500",
  editing: "bg-orange-500",
  none: "bg-red-500",
};

function getMondayOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, ...
  const offset = (dayOfWeek + 6) % 7;
  const monday = new Date(date);
  monday.setDate(monday.getDate() - offset);
  return monday;
}

export default function PlanningPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1));
  const [selectedWeekMonday, setSelectedWeekMonday] = useState<Date | null>(null);
  const [weekStatuses, setWeekStatuses] = useState<Record<string, WeekStatus>>({});

  // Calcul du début et de la fin du mois
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // Mémoriser startDate et endDate pour éviter qu'ils ne changent à chaque rendu
  const startDate = useMemo(
    () => startOfWeek(monthStart, { weekStartsOn: 1 }),
    [monthStart]
  );
  const endDate = useMemo(
    () => endOfWeek(monthEnd, { weekStartsOn: 1 }),
    [monthEnd]
  );

  // Génération des lignes (semaines) du calendrier
  const rows: Date[][] = useMemo(() => {
    const result: Date[][] = [];
    let currentDay = startDate;
    while (currentDay <= endDate) {
      const rowDays: Date[] = [];
      for (let i = 0; i < 7; i++) {
        rowDays.push(currentDay);
        currentDay = addDays(currentDay, 1);
      }
      result.push(rowDays);
    }
    return result;
  }, [startDate, endDate]);

  // Charger les statuts depuis l'API quand startDate ou endDate changent
  useEffect(() => {
    const fetchWeekStatuses = async () => {
      try {
        const startStr = format(startDate, "yyyy-MM-dd");
        const endStr = format(endDate, "yyyy-MM-dd");

        const res = await fetch(
          `/api/planning/weeksStatus?start=${startStr}&end=${endStr}`
        );
        if (!res.ok) {
          console.error("Erreur de chargement des weekStatuses");
          return;
        }
        const data = await res.json();
        if (data.weekStatuses) {
          setWeekStatuses(data.weekStatuses);
        } else {
          setWeekStatuses({});
        }
      } catch (err) {
        console.error("Erreur lors du fetch weekStatuses :", err);
      }
    };

    fetchWeekStatuses();
  }, [startDate, endDate]);

  const handleDayClick = (day: Date) => {
    const monday = getMondayOfWeek(day);
    setSelectedWeekMonday(monday);
  };

  function getDotColor(day: Date) {
    const dayKey = day.toISOString().split("T")[0];
    const st: "none" | "editing" | "confirmed" = weekStatuses[dayKey] || "none";
    return statusColors[st];
  }

  function isSelectedWeek(day: Date): boolean {
    if (!selectedWeekMonday) return false;
    const rowMonday = getMondayOfWeek(day);
    return isSameDay(rowMonday, selectedWeekMonday);
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedWeekMonday(null);
  };
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedWeekMonday(null);
  };

  const monthLabel = format(currentDate, "MMMM yyyy");

  return (
    <div className="space-y-4">
      <Card className="shadow">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </Button>
            <CardTitle className="text-lg font-bold">{monthLabel}</CardTitle>
            <Button variant="ghost" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </Button>
          </div>

          {selectedWeekMonday && (
            <Button
              variant="default"
              onClick={() =>
                router.push(
                  `/dashboard/planning/editor/${format(
                    selectedWeekMonday,
                    "yyyy-MM-dd"
                  )}`
                )
              }
            >
              Créer le planning pour la semaine du{" "}
              {format(selectedWeekMonday, "dd MMM yyyy")}
            </Button>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 text-center font-semibold border-b pb-2 mb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Jeu</div>
            <div>Ven</div>
            <div>Sam</div>
            <div>Dim</div>
          </div>

          <div className="space-y-1">
            {rows.map((week, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-7">
                {week.map((day, colIndex) => {
                  const inMonth = isSameMonth(day, currentDate);
                  const dotColor = getDotColor(day);
                  const selected = isSelectedWeek(day);

                  return (
                    <div
                      key={colIndex}
                      onClick={() => handleDayClick(day)}
                      className={`
                        relative p-2 text-sm text-center cursor-pointer
                        border hover:bg-gray-100
                        ${inMonth ? "text-black" : "text-gray-400"}
                        ${selected ? "bg-blue-50" : ""}
                      `}
                    >
                      <span>{format(day, "d")}</span>
                      <div
                        className={`${dotColor} w-2 h-2 rounded-full absolute top-1 right-1`}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <WeeklyForecastBlock monday={selectedWeekMonday} />
    </div>
  );
}
