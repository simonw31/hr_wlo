"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shift } from "./types";

type ShiftEditModalProps = {
  shift: Shift;
  onClose: () => void;
  onUpdate: (updated: Shift) => void;  // callback pour enregistrer
  onDelete: (shiftId: string) => void; // callback pour supprimer
};

// Convertit un décimal en "HH:MM"
function decimalToHHMMStr(dec: number): string {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Convertit "HH:MM" en décimal
function parseHHMMStr(str: string): number {
  const [hStr, mStr] = str.split(":");
  const hh = parseInt(hStr, 10) || 0;
  const mm = parseInt(mStr, 10) || 0;
  return hh + mm / 60;
}

export default function ShiftEditModal({
  shift,
  onClose,
  onUpdate,
  onDelete,
}: ShiftEditModalProps) {
  // On stocke les heures sous forme "HH:MM"
  const [startStr, setStartStr] = useState("00:00");
  const [endStr, setEndStr] = useState("00:00");

  useEffect(() => {
    // Au montage, on convertit le décimal en HH:MM
    setStartStr(decimalToHHMMStr(shift.startHour));
    setEndStr(decimalToHHMMStr(shift.endHour));
  }, [shift]);

  function handleSave() {
    const newStart = parseHHMMStr(startStr);
    const newEnd = parseHHMMStr(endStr);
    const updated: Shift = {
      ...shift,
      startHour: newStart,
      endHour: newEnd,
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
      className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
      // On ne ferme pas la modal au simple clic sur le fond, 
      // si vous voulez la fermer quand on clique hors du cadre : décommentez onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded shadow w-80"
        // onClick={(e) => e.stopPropagation()} // si besoin d’empêcher la fermeture en cliquant sur la modal
      >
        <h2 className="text-lg font-semibold mb-2">Éditer le Shift</h2>

        {/* Heure de début */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure début
          </label>
          <input
            type="text"
            value={startStr}
            onChange={(e) => setStartStr(e.target.value)}
            placeholder="HH:MM"
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        {/* Heure de fin */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure fin
          </label>
          <input
            type="text"
            value={endStr}
            onChange={(e) => setEndStr(e.target.value)}
            placeholder="HH:MM"
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="destructive" onClick={handleDelete}>
            Supprimer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="default" onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
