export type Employee = {
  id: string;
  name: string;
  photoUrl?: string | null;
  // Base du contrat récupérée côté serveur (contrat d'origine)
  baseContractHours: number;
  // Valeur contractuelle effective (peut être modifiée par les avenants)
  contractHours: number;
  // Optionnel : le delta apporté par un avenant (effectiveDelta = contractHours - baseContractHours)
  effectiveDelta?: number;
  // Détails du contrat avec potentiels avenants
  contract?: {
    hoursPerWeek: number;
    amendments: {
      startDate: string;
      endDate?: string;
      newHoursPerWeek: number | null;
    }[];
  };
};

export type Shift = {
  id: string;
  employeeId: string;
  employeeName: string;
  startHour: number;
  endHour: number;
  dateKey: string;
  shiftType: string;
  category: "planned" | "real";
};
