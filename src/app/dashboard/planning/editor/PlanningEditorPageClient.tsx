// /app/dashboard/planning/editor/PlanningEditorPageClient.tsx
"use client";

import React, { useState } from "react";
import { addDays, subDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PlanningGrid from "./PlanningGrid";
import ShiftEditModal from "./ShiftEditModal";
import { Shift, Employee } from "./types";

interface Props {
  employees: Employee[];
  initialShiftsByDate: Record<string, Shift[]>;
  initialDate: Date;
  initialIsLocked: boolean;
  
}

interface SaveResponse {
  message?: string;
  error?: string;
}

export default function PlanningEditorPageClient({
  employees,
  initialShiftsByDate,
  initialDate,
  initialIsLocked,
}: Props) {
  const router = useRouter();

  // État initial des shifts, de la date et du verrouillage
  const [shiftsByDate, setShiftsByDate] = useState(initialShiftsByDate);
  const [currentDay, setCurrentDay] = useState(initialDate);
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  const currentDateKey = format(currentDay, "yyyy-MM-dd");
  const dayShifts = shiftsByDate[currentDateKey] || [];

  function setShiftsForDay(
    dateKey: string,
    newShifts: Shift[] | ((prev: Shift[]) => Shift[])
  ) {
    setShiftsByDate((prev) => ({
      ...prev,
      [dateKey]:
        typeof newShifts === "function" ? newShifts(prev[dateKey] || []) : newShifts,
    }));
  }

  // Navigation entre jours
  // Navigation entre jours
  function handlePrevDay() {
    const newDate = subDays(currentDay, 1);
    setCurrentDay(newDate);
    router.push(`/dashboard/planning/editor/${format(newDate, "yyyy-MM-dd")}`);
  }

  function handleNextDay() {
    const newDate = addDays(currentDay, 1);
    setCurrentDay(newDate);
    router.push(`/dashboard/planning/editor/${format(newDate, "yyyy-MM-dd")}`);
  }

  // Création d'un shift
  function handleCreateShift(employeeId: string, hour: number) {
    const newId = Date.now().toString();
    const duration = 2;
    let end = hour + duration;
    if (end > 24) end = 24;
    const emp = employees.find((e) => e.id === employeeId);
    const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : "Inconnu";
    const newShift: Shift = {
      id: newId,
      employeeId,
      employeeName,
      startHour: hour,
      endHour: end,
      dateKey: currentDateKey,
      shiftType: "Salle",
    };
    setShiftsForDay(currentDateKey, (prev) => [...prev, newShift]);
  }

  // Édition d'un shift
  function handleShiftClick(shiftId: string, e: React.MouseEvent) {
    setEditingShiftId(shiftId);
    setModalPosition({ x: e.clientX, y: e.clientY });
  }
  function handleCloseEdit() {
    setEditingShiftId(null);
  }
  function handleUpdateShift(updated: Shift) {
    setShiftsForDay(currentDateKey, (prev) =>
      prev.map((sh) => (sh.id === updated.id ? updated : sh))
    );
  }
  function handleDeleteShift(shiftId: string) {
    setShiftsForDay(currentDateKey, (prev) =>
      prev.filter((sh) => sh.id !== shiftId)
    );
  }

  // Sauvegarde des shifts
  async function handleSave() {
    try {
      const payload = {
        date: currentDateKey,
        shifts: dayShifts,
        lock: false, // ici, la sauvegarde ne change pas le verrouillage
      };

      console.log("Payload envoyé :", payload);

      const response = await fetch("/api/planning/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log("Réponse brute de save :", text);

      let data: SaveResponse = {};
      if (text) {
        data = JSON.parse(text) as SaveResponse;
      }

      if (!response.ok) {
        console.error("Erreur de sauvegarde:", data.error);
        alert(`Erreur de sauvegarde: ${data.error}`);
        return;
      }

      alert("Planning sauvegardé avec succès.");
      // On peut rafraîchir ici si besoin (par exemple via un GET)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde.");
    }
  }

  // Bouton de verrouillage/déverrouillage
  async function handleToggleLock() {
    try {
      const newLock = !isLocked;
      const payload = {
        date: currentDateKey,
        lock: newLock,
      };
      const response = await fetch("/api/planning/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      console.log("Réponse lock :", text);
      if (!response.ok) {
        alert("Erreur lors de la mise à jour du verrouillage");
        return;
      }
      const data = JSON.parse(text);
      setIsLocked(data.locked);
      alert("Statut de verrouillage mis à jour");
    } catch (error) {
      console.error("Erreur lors du toggle du verrouillage:", error);
      alert("Erreur lors de la mise à jour du verrouillage");
    }
  }

  // Gestion du redimensionnement des shifts (exemple)
  function handleResizeMouseDown(e: React.MouseEvent, shiftId: string) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const shiftToResize = dayShifts.find((sh) => sh.id === shiftId);
    if (!shiftToResize) return;
    const originalEnd = shiftToResize.endHour;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const quarterHoursMoved = Math.round((deltaX / 60) * 4) / 4;
      let newEnd = originalEnd + quarterHoursMoved;
      newEnd = Math.round(newEnd * 4) / 4;
      if (newEnd > 24) newEnd = 24;
      if (newEnd <= shiftToResize.startHour) {
        newEnd = shiftToResize.startHour + 0.25;
      }
      setShiftsForDay(currentDateKey, (prev) =>
        prev.map((sh) => (sh.id === shiftId ? { ...sh, endHour: newEnd } : sh))
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  const dayLabel = format(currentDay, "EEEE dd MMM yyyy");
  const editingShift = dayShifts.find((sh) => sh.id === editingShiftId);

  return (
    <div className="p-4 space-y-4 h-screen flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Éditeur de Planning - {dayLabel}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handlePrevDay}>
            Jour précédent
          </Button>
          <Button variant="ghost" onClick={handleNextDay}>
            Jour suivant
          </Button>
          <Button variant="default" onClick={handleSave}>
            Sauvegarder
          </Button>
          <Button variant="outline" onClick={handleToggleLock}>
            {isLocked ? "Déverrouiller le planning" : "Verrouiller le planning"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <PlanningGrid
          dateKey={currentDateKey}
          employees={employees}
          shifts={dayShifts}
          setShifts={(newShifts) => setShiftsForDay(currentDateKey, newShifts)}
          onShiftClick={handleShiftClick}
          onCreateShift={handleCreateShift}
          onResizeMouseDown={handleResizeMouseDown}
          shiftsByDate={shiftsByDate}
          activeShift={activeShift}
          setActiveShift={setActiveShift}
        />
      </div>

      {editingShift && (
        <ShiftEditModal
          shift={editingShift}
          onClose={handleCloseEdit}
          onUpdate={handleUpdateShift}
          onDelete={handleDeleteShift}
          modalPosition={modalPosition}
        />
      )}
    </div>
  );
}
