// src/app/dashboard/planning/editor/types.ts
export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  contractHours: number;
  availability?: AvailabilityInterval[];
};

export type Shift = {
  id: string;
  employeeId: string;
  employeeName: string;
  startHour: number;    // de 0 à 24
  endHour: number;      // de 0 à 24
  dateKey: string;      // format "yyyy-MM-dd"
  shiftType: string;    // ex. "Cuisine", "Salle", etc.
};

export type AvailabilityInterval = {
  id: string;
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche";
  allDay: boolean;
  startTime?: string; // format "HH:mm"
  endTime?: string;   // format "HH:mm"
};
