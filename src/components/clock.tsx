"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock as ClockIcon } from "lucide-react";

export default function Clock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <ClockIcon className="w-8 h-8 text-blue-600" />
      <div className="text-4xl font-bold text-gray-900">
        {format(time, "HH:mm", { locale: fr })}
      </div>
      <div className="text-sm text-gray-500">
        {format(time, "EEEE d MMMM yyyy", { locale: fr })}
      </div>
    </div>
  );
}