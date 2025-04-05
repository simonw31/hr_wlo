"use client";

import React from "react";
import { Employee, Shift } from "./types";

function decimalToHHMM(dec: number) {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Fonction utilitaire pour calculer les heures effectives
function getEffectiveContractHours(emp: Employee, planningDate: Date): number {
  // Si l'employé possède des informations détaillées sur son contrat
  // incluant d'éventuels avenants
  if (emp.contract && emp.contract.amendments && emp.contract.amendments.length > 0) {
    let effectiveHours = emp.contract.hoursPerWeek;
    for (const amendment of emp.contract.amendments) {
      const startDate = new Date(amendment.startDate);
      const endDate = amendment.endDate ? new Date(amendment.endDate) : null;
      // L'avenant est actif si la date de planification se situe entre startDate et endDate (ou sans fin définie)
      if (planningDate >= startDate && (endDate ? planningDate <= endDate : true)) {
        if (amendment.newHoursPerWeek !== null) {
          effectiveHours = amendment.newHoursPerWeek;
        }
        break;
      }
    }
    return effectiveHours;
  }
  // Sinon, on utilise directement la valeur pré-calculée
  return emp.contractHours;
}

type DailyHoursGridProps = {
  employees: Employee[];
  plannedShifts: Shift[];
  realShifts: Shift[];
  onShiftClick?: (shift: Shift, e: React.MouseEvent) => void;
};

export default function DailyHoursGrid({
  employees,
  plannedShifts,
  realShifts,
  onShiftClick,
}: DailyHoursGridProps) {
  const totalHours = 24;
  const hourWidth = 60; // largeur en pixels pour chaque colonne d'heure

  // On définit ici la date de planification (par exemple, aujourd'hui)
  const planningDate = new Date();

  return (
    <div className="w-full h-full">
      {/* Entête avec les heures */}
      <div className="flex border-b bg-gray-50 sticky top-0 z-10 h-12">
        <div className="w-48 min-w-[12rem] border-r flex items-center justify-center font-semibold bg-white">
          Employé
        </div>
        <div className="relative flex-1 min-w-[1440px]">
          <div className="flex h-full">
            {Array.from({ length: totalHours }, (_, i) => (
              <div
                key={i}
                className="border-r border-gray-200 flex items-center justify-center"
                style={{ width: hourWidth }}
              >
                <span className="text-sm text-gray-600">{String(i).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lignes pour chaque employé */}
      <div className="overflow-auto" style={{ height: "calc(100% - 3rem)" }}>
        {employees.map((emp) => {
          const empPlanned = plannedShifts.filter((sh) => sh.employeeId === emp.id);
          const empReal = realShifts.filter((sh) => sh.employeeId === emp.id);

          // Calcul des heures effectives en tenant compte des avenants
          const effectiveContractHours = getEffectiveContractHours(emp, planningDate);

          return (
            <div
              key={emp.id}
              className="flex border-b hover:bg-gray-50/50 transition-colors relative group animate-fadeIn"
              style={{ height: "80px" }}
            >
              {/* Infos employé */}
              <div className="w-48 min-w-[12rem] border-r flex items-center px-3 gap-3 bg-white">
                <div className="relative">
                  <img
                    src={emp.photoUrl || "/images/profile.jpg"}
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 truncate">{emp.name}</span>
                  <span className="text-xs text-gray-500">{effectiveContractHours}h/semaine</span>
                </div>
              </div>

              {/* Grille temporelle */}
              <div className="relative flex-1 min-w-[1440px]">
                <div className="absolute inset-0 flex pointer-events-none">
                  {Array.from({ length: totalHours }, (_, i) => (
                    <div
                      key={i}
                      className="border-r border-gray-100 flex-none"
                      style={{ width: hourWidth }}
                    />
                  ))}
                </div>

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 transition-all duration-1000"
                  style={{
                    left: `${(new Date().getHours() + new Date().getMinutes() / 60) * hourWidth}px`,
                  }}
                >
                  <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="absolute -bottom-1 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>

                {empPlanned.map((shift) => {
                  const left = shift.startHour * hourWidth;
                  const width = (shift.endHour - shift.startHour) * hourWidth;
                  return (
                    <div
                      key={`planned-${shift.id}`}
                      className="absolute h-8 top-2 bg-gray-100 rounded-md border border-gray-300 
                               flex items-center px-2 cursor-pointer transition-all duration-200
                               hover:bg-gray-200 hover:border-gray-400 group/shift"
                      style={{ left: `${left}px`, width: `${width}px` }}
                      onClick={(e) => onShiftClick?.(shift, e)}
                      title={`Planifié: ${decimalToHHMM(shift.startHour)} - ${decimalToHHMM(shift.endHour)}`}
                    >
                      <span className="text-xs font-medium text-gray-700 truncate whitespace-nowrap">
                        {decimalToHHMM(shift.startHour)} - {decimalToHHMM(shift.endHour)}
                      </span>
                      <div className="absolute invisible group-hover/shift:visible bg-gray-800 text-white text-xs py-1 px-2 rounded -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        Planifié: {decimalToHHMM(shift.startHour)} - {decimalToHHMM(shift.endHour)}
                      </div>
                    </div>
                  );
                })}

                {empReal.map((shift) => {
                  const left = shift.startHour * hourWidth;
                  const width = (shift.endHour - shift.startHour) * hourWidth;
                  return (
                    <div
                      key={`real-${shift.id}`}
                      className="absolute h-8 bottom-2 bg-blue-50 rounded-md border border-blue-200
                               flex items-center px-2 cursor-pointer transition-all duration-200
                               hover:bg-blue-100 hover:border-blue-300 group/shift"
                      style={{ left: `${left}px`, width: `${width}px` }}
                      onClick={(e) => onShiftClick?.(shift, e)}
                      title={`Réel: ${decimalToHHMM(shift.startHour)} - ${decimalToHHMM(shift.endHour)}`}
                    >
                      <span className="text-xs font-medium text-blue-700 truncate whitespace-nowrap">
                        {decimalToHHMM(shift.startHour)} - {decimalToHHMM(shift.endHour)}
                      </span>
                      <div className="absolute invisible group-hover/shift:visible bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        Réel: {decimalToHHMM(shift.startHour)} - {decimalToHHMM(shift.endHour)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
