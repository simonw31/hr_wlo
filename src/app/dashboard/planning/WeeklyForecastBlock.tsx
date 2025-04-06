"use client";

import React, { useState } from "react";
import { addDays, format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type WeeklyForecastBlockProps = {
  monday: Date | null; // Peut être null
};

export default function WeeklyForecastBlock({ monday }: WeeklyForecastBlockProps) {
  // Appel du hook toujours exécuté
  const [forecasts, setForecasts] = useState<number[]>(() => Array(7).fill(0));

  // Si aucune semaine sélectionnée, on affiche un message
  if (!monday) {
    return (
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Sélectionnez une semaine pour faire les prévisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Aucune semaine n&apos;est actuellement sélectionnée dans le calendrier.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcul des 7 jours (lundi -> dimanche)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  function handleChange(index: number, value: string) {
    setForecasts((prev) => {
      const newArr = [...prev];
      newArr[index] = parseInt(value, 10) || 0;
      return newArr;
    });
  }

  function handleSave() {
    console.log("Prévisions enregistrées :", forecasts);
    alert("Prévisions enregistrées (console) !");
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Prévisions pour la semaine du {format(monday, "dd MMM yyyy")} au{" "}
          {format(addDays(monday, 6), "dd MMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-sm font-medium mb-1">
                {format(day, "EEE dd")}
              </span>
              <Input
                type="number"
                value={forecasts[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-20"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="default" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
