"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Paintbrush } from "lucide-react";

export default function PlanningTab() {
  const [dayBoundaryStart, setDayBoundaryStart] = useState("00:00");
  const [dayBoundaryEnd, setDayBoundaryEnd] = useState("23:59");
  const [posteSelected, setPosteSelected] = useState("Cuisine");
  const [minShift, setMinShift] = useState("4");
  const [maxHoursNoBreak, setMaxHoursNoBreak] = useState("6");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Début / fin de journée */}
        <div className="space-y-2">
          <Label htmlFor="start">Heure de début de journée</Label>
          <Input
            id="start"
            type="time"
            value={dayBoundaryStart}
            onChange={(e) => setDayBoundaryStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Heure de fin de journée</Label>
          <Input
            id="end"
            type="time"
            value={dayBoundaryEnd}
            onChange={(e) => setDayBoundaryEnd(e.target.value)}
          />
        </div>

        {/* Poste par défaut */}
        <div className="space-y-2">
          <Label htmlFor="poste">Poste par défaut</Label>
          <Select value={posteSelected} onValueChange={setPosteSelected}>
            <SelectTrigger id="poste">
              <SelectValue placeholder="Choisissez un poste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cuisine">Cuisine</SelectItem>
              <SelectItem value="Salle">Salle</SelectItem>
              <SelectItem value="Réception">Réception</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Durée minimum / heures max sans pause */}
        <div className="space-y-2">
          <Label htmlFor="minShift">Durée minimum d’un shift (h)</Label>
          <Input
            id="minShift"
            type="number"
            value={minShift}
            onChange={(e) => setMinShift(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxNoBreak">Heures max sans pause</Label>
          <Input
            id="maxNoBreak"
            type="number"
            value={maxHoursNoBreak}
            onChange={(e) => setMaxHoursNoBreak(e.target.value)}
          />
        </div>

        {/* Couleurs de planification */}
        <div className="space-y-2">
          <Label>Couleurs de planification</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Paintbrush className="h-4 w-4" />
              Personnaliser
            </Button>
            <span className="text-sm text-gray-500">(à implémenter)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
