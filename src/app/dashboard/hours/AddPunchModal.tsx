"use client";

import React, { useState } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Employee, Shift } from "./types";

function parseTimeFlexible(str: string): number {
  const raw = str.trim();

  const matchColon = raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if (matchColon) {
    const hh = parseInt(matchColon[1], 10);
    const mm = parseInt(matchColon[2], 10);
    return hh + mm / 60;
  }

  const matchInt = raw.match(/^(\d{1,2})$/);
  if (matchInt) {
    const hh = parseInt(matchInt[1], 10);
    return hh;
  }

  const matchDec = raw.match(/^(\d{1,2})\.(\d+)$/);
  if (matchDec) {
    const hh = parseInt(matchDec[1], 10);
    const fractionStr = "0." + matchDec[2];
    const fraction = parseFloat(fractionStr);
    return hh + fraction;
  }

  throw new Error(
    'Format invalide. Essayez "HH:MM", ou "HH", ou "HH.decimal" (ex: "16.5" => 16h30).'
  );
}

export type AddPunchModalProps = {
  employees: Employee[];
  currentDay: Date;
  onClose: () => void;
  onAdd: (newShift: Shift) => void;
};

export default function AddPunchModal({
  employees,
  currentDay,
  onClose,
  onAdd,
}: AddPunchModalProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees.length > 0 ? employees[0].id : ""
  );
  const [checkInStr, setCheckInStr] = useState("18");
  const [checkOutStr, setCheckOutStr] = useState("21");

  async function handleAddPunch() {
    let checkInDecimal: number;
    let checkOutDecimal: number;

    try {
      checkInDecimal = parseTimeFlexible(checkInStr);
      checkOutDecimal = parseTimeFlexible(checkOutStr);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      alert(message);
      return;
    }

    const year = currentDay.getUTCFullYear();
    const month = String(currentDay.getUTCMonth() + 1).padStart(2, "0");
    const day = String(currentDay.getUTCDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const dateOnly = new Date(
      Date.UTC(year, currentDay.getUTCMonth(), currentDay.getUTCDate())
    );
    const newCheckIn = new Date(dateOnly);
    newCheckIn.setUTCHours(
      Math.floor(checkInDecimal),
      Math.round((checkInDecimal % 1) * 60),
      0,
      0
    );
    const newCheckOut = new Date(dateOnly);
    newCheckOut.setUTCHours(
      Math.floor(checkOutDecimal),
      Math.round((checkOutDecimal % 1) * 60),
      0,
      0
    );

    const payload = {
      employeeId: selectedEmployeeId,
      date: dateKey,
      checkIn: newCheckIn.toISOString(),
      checkOut: newCheckOut.toISOString(),
    };

    try {
      const res = await fetch("/api/time-records/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur création pointage");
      }
      const newRecord = await res.json();

      const newShift: Shift = {
        id: newRecord.id,
        employeeId: selectedEmployeeId,
        employeeName:
          employees.find((emp) => emp.id === selectedEmployeeId)?.name || "",
        startHour: checkInDecimal,
        endHour: checkOutDecimal,
        dateKey,
        shiftType: "real",
        category: "real",
      };
      onAdd(newShift);
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error(error);
      alert(message);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white p-4 rounded shadow w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold mb-4">
            Ajouter un pointage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Employé</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={(val) => setSelectedEmployeeId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>Heure d&apos;entrée</Label>
            <Input
              type="text"
              value={checkInStr}
              onChange={(e) => setCheckInStr(e.target.value)}
              placeholder='Ex: &quot;16&quot;, &quot;16.5&quot;, &quot;16:15&quot;'
            />
          </div>

          <div className="mb-4">
            <Label>Heure de sortie</Label>
            <Input
              type="text"
              value={checkOutStr}
              onChange={(e) => setCheckOutStr(e.target.value)}
              placeholder='Ex: &quot;20&quot;, &quot;20.75&quot;, &quot;20:45&quot;'
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="default" onClick={handleAddPunch}>
              Ajouter
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
