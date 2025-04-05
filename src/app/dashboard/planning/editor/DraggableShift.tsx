"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Shift } from "./types";

type DraggableShiftProps = {
  shift: Shift;
  style: React.CSSProperties;
  onClick: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent, shiftId: string) => void;
};

function formatHourMinute(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function DraggableShift({
  shift,
  style,
  onClick,
  onResizeMouseDown,
}: DraggableShiftProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: shift.id,
  });

  const finalStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    position: "absolute",
    top: 4,
    bottom: 4,
  };

  return (
    <div
      ref={setNodeRef}
      style={finalStyle}
      className="bg-blue-300 text-white rounded px-2 py-1 cursor-move select-none flex flex-col justify-center group relative hover:bg-blue-400 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      {...listeners}
      {...attributes}
    >
      <div className="text-sm font-semibold truncate">{shift.employeeName}</div>
      <div className="text-xs">
        {formatHourMinute(shift.startHour)} - {formatHourMinute(shift.endHour)}
      </div>
      <div className="text-xs italic truncate">{shift.shiftType}</div>
      
      {/* Poignée de redimensionnement */}
      <div
        className="absolute top-0 bottom-0 right-0 w-2 bg-blue-400 opacity-0 group-hover:opacity-100 cursor-ew-resize transition-opacity rounded-r"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeMouseDown(e, shift.id);
        }}
      />
    </div>
  );
}