"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Employee, Shift } from "./types";
import { Clock, Search, ChevronLeft, ChevronRight, Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

type WeeklyHoursSummaryProps = {
  employees: Employee[];
  plannedShifts: Shift[];
  realShifts: Shift[];
};

export default function WeeklyHoursSummary({
  employees,
  plannedShifts,
  realShifts,
}: WeeklyHoursSummaryProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Calcul des heures pour la semaine sélectionnée
  function getWeeklyHours(shifts: Shift[], empId: string) {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Dimanche

    return Math.round(
      shifts
        .filter(s => s.employeeId === empId)
        .filter(s => {
          const shiftDate = new Date(s.dateKey);
          return shiftDate >= weekStart && shiftDate <= weekEnd;
        })
        .reduce((acc, s) => acc + (s.endHour - s.startHour), 0)
      * 100
    ) / 100;
  }

  // Calcul des heures supplémentaires
  function getOvertimeHours(realHours: number, contractHours: number) {
    const overtime = Math.max(0, realHours - contractHours);
    return {
      overtime10: Math.min(4, overtime), // Premières 4h à 10%
      overtime25: Math.min(4, Math.max(0, overtime - 4)), // 4h suivantes à 25%
      overtime50: Math.max(0, overtime - 8), // Au-delà de 8h à 50%
    };
  }

  function getStatusColor(delta: number) {
    if (delta > 2) return "text-red-600 bg-red-50 border-red-200";
    if (delta < -2) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-green-600 bg-green-50 border-green-200";
  }

  function getStatusIcon(delta: number) {
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  }

  // Navigation entre les semaines
  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  // Filtrage des employés
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-white">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Vue hebdomadaire
            </CardTitle>
            <div className="flex items-center gap-4">
              <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd MMM", { locale: fr })} - 
                {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), " dd MMM yyyy", { locale: fr })}
              </span>
              <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto p-6">
        <div className="grid gap-4">
          {filteredEmployees.map((emp) => {
            const plannedHours = getWeeklyHours(plannedShifts, emp.id);
            const realHours = getWeeklyHours(realShifts, emp.id);
            const weeklyContract = emp.contractHours;
            const delta = realHours - weeklyContract;
            const deltaStatus = getStatusColor(delta);
            const overtime = getOvertimeHours(realHours, weeklyContract);

            return (
              <div
                key={emp.id}
                className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md animate-fadeIn"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={emp.photoUrl || "/images/profile.jpg"}
                        alt={emp.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase className="w-4 h-4" />
                        <span>{weeklyContract}h contractuelles</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${deltaStatus}`}>
                    {getStatusIcon(delta)}
                    {delta > 0 ? `+${delta}h` : `${delta}h`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-gray-500">Heures planifiées</div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-blue-600">{plannedHours}</span>
                      <span className="ml-1 text-gray-500">heures</span>
                    </div>
                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(plannedHours / weeklyContract) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-gray-500">Heures réelles</div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-indigo-600">{realHours}</span>
                      <span className="ml-1 text-gray-500">heures</span>
                    </div>
                    <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${(realHours / weeklyContract) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {(overtime.overtime10 > 0 || overtime.overtime25 > 0 || overtime.overtime50 > 0) && (
                  <div className="flex gap-2 mt-2">
                    {overtime.overtime10 > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        +10% : {overtime.overtime10}h
                      </span>
                    )}
                    {overtime.overtime25 > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        +25% : {overtime.overtime25}h
                      </span>
                    )}
                    {overtime.overtime50 > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        +50% : {overtime.overtime50}h
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}