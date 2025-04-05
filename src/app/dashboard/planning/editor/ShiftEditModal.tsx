"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shift } from "./types";

export type ShiftEditModalProps = {
  shift: Shift;
  onClose: () => void;
  onUpdate: (updated: Shift) => void;
  onDelete: (shiftId: string) => void;
  modalPosition: { x: number; y: number };
};

export default function ShiftEditModal({
  shift,
  onClose,
  onUpdate,
  onDelete,
  modalPosition,
}: ShiftEditModalProps) {
  const [startHour, setStartHour] = useState(Math.floor(shift.startHour));
  const [startMinute, setStartMinute] = useState(Math.round((shift.startHour % 1) * 60));
  const [endHour, setEndHour] = useState(Math.floor(shift.endHour));
  const [endMinute, setEndMinute] = useState(Math.round((shift.endHour % 1) * 60));
  const [shiftType, setShiftType] = useState(shift.shiftType);

  function handleSave() {
    const updated = {
      ...shift,
      startHour: startHour + (startMinute / 60),
      endHour: endHour + (endMinute / 60),
      shiftType
    };
    onUpdate(updated);
    onClose();
  }

  function handleDelete() {
    onDelete(shift.id);
    onClose();
  }

  return (
    <div
      className="absolute bg-white border rounded shadow-lg p-4 z-50"
      style={{ top: modalPosition.y + 10, left: modalPosition.x, width: 300 }}
    >
      <h2 className="text-lg font-semibold mb-4">Éditer le shift</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Type :</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
          >
            <option value="Cuisine">Cuisine</option>
            <option value="Salle">Salle</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Début :</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              className="w-20 border rounded p-2 text-sm"
              value={startHour}
              min={0}
              max={23}
              onChange={(e) => setStartHour(Math.min(parseInt(e.target.value, 10), endHour))}
            />
            <span className="text-sm">h</span>
            <select
              className="w-20 border rounded p-2 text-sm"
              value={startMinute}
              onChange={(e) => setStartMinute(parseInt(e.target.value, 10))}
            >
              <option value="0">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <span className="text-sm">min</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Fin :</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              className="w-20 border rounded p-2 text-sm"
              value={endHour}
              min={0}
              max={24}
              onChange={(e) => setEndHour(Math.max(parseInt(e.target.value, 10), startHour))}
            />
            <span className="text-sm">h</span>
            <select
              className="w-20 border rounded p-2 text-sm"
              value={endMinute}
              onChange={(e) => setEndMinute(parseInt(e.target.value, 10))}
            >
              <option value="0">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <span className="text-sm">min</span>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Supprimer
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}