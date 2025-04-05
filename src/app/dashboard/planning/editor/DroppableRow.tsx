"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Employee, Shift } from "./types";
import DraggableShift from "./DraggableShift";

type Props = {
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
};

export default function DroppableRow({
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
}: Props) {
  const { setNodeRef } = useDroppable({ id: employee.id });

  function handleDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const hour = Math.floor(offsetX / colWidth);
    onCreateShift(employee.id, hour);
  }

  return (
    <div
      id={`row-${employee.id}`}
      ref={setNodeRef}
      className="flex border-b relative"
      style={{ height: rowHeight }}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-40 border-r flex flex-col items-center justify-center font-medium text-sm px-2 select-none">
        <span>
          {employee.firstName} {employee.lastName}
        </span>
        <span className="text-xs text-gray-500">
          {weekHours} / {employee.contractHours}h
        </span>
      </div>

      <div className="relative flex-1 select-none" style={{ minWidth: totalWidth }}>
        {/* Lignes verticales */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="border-r" style={{ width: colWidth }} />
          ))}
        </div>

        {/* Rendu des shifts */}
        {shifts.map((shift) => {
          const isActive = shift.id === activeShift?.id;

          // Debug : log pour vérifier la détection
          if (isActive) {
            console.log(
              "Shift",
              shift.id,
              "est en cours de drag, on ne le rend pas dans la grille."
            );
            // On peut ajouter un style fallback si on ne retournait pas null :
            // style={{ display: "none" }}
            return null;
          }

          const left = shift.startHour * colWidth;
          const width = (shift.endHour - shift.startHour) * colWidth;

          return (
            <DraggableShift
              key={shift.id}
              shift={shift}
              style={{ left, width }}
              onClick={(e) => onShiftClick(shift.id, e)}
              onResizeMouseDown={(e) => onResizeMouseDown(e, shift.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
