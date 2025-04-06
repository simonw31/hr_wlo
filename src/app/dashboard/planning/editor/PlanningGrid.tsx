"use client";

import React, { useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { Employee, Shift } from "./types";
import DraggableShift from "./DraggableShift";
import { getEmployeeWeekHours, getEmployeeName } from "./utils";

export const colWidth = 15; // 15px par 15 minutes
export const rowHeight = 80;
const hoursCount = 24;
const quartersPerHour = 4;

type PlanningGridProps = {
  dateKey: string;
  employees: Employee[];
  shifts: Shift[];
  setShifts: (shifts: Shift[] | ((prev: Shift[]) => Shift[])) => void;
  onShiftClick: (shiftId: string, e: React.MouseEvent) => void;
  onCreateShift: (employeeId: string, hour: number) => void;
  onResizeMouseDown: (e: React.MouseEvent, shiftId: string) => void;
  shiftsByDate: Record<string, Shift[]>;
  activeShift: Shift | null;
  setActiveShift: (shift: Shift | null) => void;
};

export default function PlanningGrid({
  dateKey,
  employees,
  shifts,
  setShifts,
  onShiftClick,
  onCreateShift,
  onResizeMouseDown,
  shiftsByDate,
  activeShift,
  setActiveShift,
}: PlanningGridProps) {
  const totalWidth = hoursCount * colWidth * quartersPerHour;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const draggedShift = shifts.find((shift) => shift.id === active.id);
    if (draggedShift) {
      setActiveShift(draggedShift);
    }
  }, [shifts, setActiveShift]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (!over || !activeShift) {
      setActiveShift(null);
      return;
    }

    const newEmployeeId = over.id.toString();
    const draggedShiftId = active.id.toString();
    
    // Calculer le nouveau startHour basé sur le déplacement
    const quarterHoursDelta = Math.round((delta.x / colWidth) / quartersPerHour * 4) / 4;
    const shiftToUpdate = shifts.find(shift => shift.id === draggedShiftId);
    
    if (!shiftToUpdate) {
      setActiveShift(null);
      return;
    }

    let newStartHour = Math.round((shiftToUpdate.startHour + quarterHoursDelta) * 4) / 4;
    const duration = shiftToUpdate.endHour - shiftToUpdate.startHour;

    // S'assurer que les heures restent dans les limites
    if (newStartHour < 0) newStartHour = 0;
    if (newStartHour + duration > 24) newStartHour = 24 - duration;

    setShifts((prevShifts) =>
      prevShifts.map((shift) => {
        if (shift.id === draggedShiftId) {
          return {
            ...shift,
            employeeId: newEmployeeId,
            employeeName: getEmployeeName(employees, newEmployeeId),
            startHour: newStartHour,
            endHour: newStartHour + duration,
          };
        }
        return shift;
      })
    );

    setActiveShift(null);
  }, [activeShift, employees, setShifts, setActiveShift, shifts]);

  function formatHourMinute(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour % 1) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div className="overflow-auto border rounded-lg shadow-sm bg-white h-full">
        <div style={{ minWidth: `${totalWidth + 160}px` }}>
          {/* En-tête des heures */}
          <div className="flex border-b sticky top-0 bg-gray-50 z-10" style={{ height: 40 }}>
            <div className="w-40 border-r flex items-center justify-center font-semibold bg-gray-50">
              Heures
            </div>
            <div className="flex flex-1">
              {Array.from({ length: hoursCount }, (_, i: number) => (
                <div 
                  key={i} 
                  className="border-r flex items-center justify-center text-sm text-gray-600" 
                  style={{ 
                    width: colWidth * quartersPerHour,
                    backgroundColor: i % 2 === 0 ? 'rgba(243, 244, 246, 0.5)' : 'transparent'
                  }}
                >
                  {String(i).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Grille des employés */}
          <div className="relative">
            {employees.map((emp) => {
              const empShifts = shifts.filter(
                (s) => s.employeeId === emp.id && (!activeShift || s.id !== activeShift.id)
              );
              const weekHours = getEmployeeWeekHours(emp.id, shiftsByDate, dateKey);
              
              return (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  shifts={empShifts}
                  dateKey={dateKey}
                  onShiftClick={onShiftClick}
                  onCreateShift={onCreateShift}
                  onResizeMouseDown={onResizeMouseDown}
                  colWidth={colWidth}
                  rowHeight={rowHeight}
                  totalWidth={totalWidth}
                  weekHours={weekHours}
                  activeShift={activeShift}
                  quartersPerHour={quartersPerHour}
                />
              );
            })}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeShift && (
          <div 
            className="bg-blue-400 text-white rounded px-2 py-1 opacity-90 pointer-events-none"
            style={{
              width: (activeShift.endHour - activeShift.startHour) * colWidth * quartersPerHour,
              height: rowHeight - 8,
            }}
          >
            <div className="text-sm font-semibold truncate">{activeShift.employeeName}</div>
            <div className="text-xs">
              {formatHourMinute(activeShift.startHour)} - {formatHourMinute(activeShift.endHour)}
            </div>
            <div className="text-xs italic truncate">{activeShift.shiftType}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

type EmployeeRowProps = {
  employee: Employee;
  shifts: Shift[];
  dateKey: string;
  onShiftClick: (shiftId: string, e: React.MouseEvent) => void;
  onCreateShift: (employeeId: string, hour: number) => void;
  onResizeMouseDown: (e: React.MouseEvent, shiftId: string) => void;
  colWidth: number;
  rowHeight: number;
  totalWidth: number;
  weekHours: number;
  activeShift: Shift | null;
  quartersPerHour: number;
};

function EmployeeRow({
  employee,
  shifts,
  dateKey,
  onShiftClick,
  onCreateShift,
  onResizeMouseDown,
  colWidth,
  rowHeight,
  totalWidth,
  weekHours,
  activeShift,
  quartersPerHour,
}: EmployeeRowProps) {
  const { setNodeRef } = useDroppable({
    id: employee.id,
  });

  // --- Nouvelle logique pour la disponibilité ---
  // Conversion de dateKey en Date et détermination du jour (en français)
  const currentDate = new Date(dateKey);
  const dayIndex = currentDate.getDay();
  const dayMap: Record<number, string> = {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
  };
  const currentDayName = dayMap[dayIndex];

  // Récupérer la disponibilité de l'employé pour le jour courant
  const availabilityForDay = employee.availability?.find(
    (av) => av.day === currentDayName
  );

  let availableStart = 0; // en heures
  let availableEnd = 24;  // en heures
  if (availabilityForDay && !availabilityForDay.allDay) {
    if (availabilityForDay.startTime) {
      const [h, m] = availabilityForDay.startTime.split(":").map(Number);
      availableStart = h + m / 60;
    }
    if (availabilityForDay.endTime) {
      const [h, m] = availabilityForDay.endTime.split(":").map(Number);
      availableEnd = h + m / 60;
    }
  }
  // --- Fin de la logique disponibilité ---

  return (
    <div 
      ref={setNodeRef}
      className="flex border-b hover:bg-gray-50 transition-colors relative" 
      style={{ height: rowHeight }}
    >
      {/* Colonne d'information de l'employé */}
      <div className="w-40 border-r flex flex-col items-center justify-center p-2 bg-white sticky left-0 z-10">
        <div className="font-medium text-sm">
          {employee.firstName} {employee.lastName}
        </div>
        <div className="text-xs text-gray-500">
          {weekHours} / {employee.contractHours}h
        </div>
      </div>

      {/* Zone des shifts */}
      <div 
        className="relative flex-1" 
        style={{ minWidth: totalWidth }}
        onDoubleClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const quarterHour = Math.floor(offsetX / (colWidth * quartersPerHour));
          onCreateShift(employee.id, quarterHour);
        }}
      >
        {/* Lignes verticales */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: hoursCount }, (_, i) => (
            <div 
              key={i} 
              className="border-r border-gray-200" 
              style={{ 
                width: colWidth * quartersPerHour,
                backgroundColor: i % 2 === 0 ? 'rgba(243, 244, 246, 0.2)' : 'transparent'
              }} 
            />
          ))}
        </div>

        {/* Overlay des créneaux non disponibles */}
        {availabilityForDay && !availabilityForDay.allDay && (
          <>
            {availableStart > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: availableStart * colWidth * quartersPerHour,
                  height: "100%",
                  backgroundColor: "rgba(128,128,128,0.3)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
            )}
            {availableEnd < 24 && (
              <div
                style={{
                  position: "absolute",
                  left: availableEnd * colWidth * quartersPerHour,
                  top: 0,
                  width: (24 - availableEnd) * colWidth * quartersPerHour,
                  height: "100%",
                  backgroundColor: "rgba(128,128,128,0.3)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        )}

        {/* Affichage des shifts */}
        {shifts.map((shift) => (
          <DraggableShift
            key={shift.id}
            shift={shift}
            style={{
              left: shift.startHour * colWidth * quartersPerHour,
              width: (shift.endHour - shift.startHour) * colWidth * quartersPerHour,
            }}
            onClick={(e) => onShiftClick(shift.id, e)}
            onResizeMouseDown={(e) => onResizeMouseDown(e, shift.id)}
          />
        ))}
      </div>
    </div>
  );
}
