// app/api/planning/weeksStatus/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO, eachDayOfInterval } from "date-fns";

/**
 * Calcule le lundi d'une date donnée (en tenant compte du fait que le lundi est weekStartsOn:1).
 */
function getMondayOfWeek(date: Date): Date {
  // getDay() renvoie 0 pour Dimanche, 1 pour Lundi, ...
  const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, ...
  // On veut un offset pour revenir au lundi
  const offset = (dayOfWeek + 6) % 7; 
  const monday = new Date(date);
  monday.setDate(monday.getDate() - offset);
  return monday;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Missing 'start' or 'end' query param" },
        { status: 400 }
      );
    }

    const start = parseISO(startParam);
    const end = parseISO(endParam);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // 1) Récupérer tous les DayLock dans [start, end]
    const dayLocks = await prisma.dayLock.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // 2) Récupérer tous les shifts dans [start, end]
    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // 3) Construire des maps pour accéder rapidement aux infos
    //    - dayLockMap[yyyy-MM-dd] = locked (true/false)
    //    - shiftCountMap[yyyy-MM-dd] = nombre de shifts
    const dayLockMap: Record<string, boolean> = {};
    for (const dl of dayLocks) {
      const key = dl.date.toISOString().split("T")[0];
      dayLockMap[key] = dl.locked;
    }

    const shiftCountMap: Record<string, number> = {};
    for (const sh of shifts) {
      const key = sh.date.toISOString().split("T")[0];
      shiftCountMap[key] = (shiftCountMap[key] || 0) + 1;
    }

    // 4) On parcourt tous les jours de [start, end],
    //    on calcule leur lundi, puis on en déduit un statut.
    //    On stocke le résultat dans weekStatuses[mondayKey].
    //    - "confirmed" si locked == true
    //    - "editing" si shiftCount > 0 mais locked == false
    //    - "none" si shiftCount == 0

    const weekStatuses: Record<string, "none" | "editing" | "confirmed"> = {};

    // Génère chaque jour dans l'intervalle
    const allDays = eachDayOfInterval({ start, end });

    for (const day of allDays) {
      const monday = getMondayOfWeek(day);
      const mondayKey = monday.toISOString().split("T")[0];

      // Si on a déjà défini un statut pour ce lundi, on ne le redéfinit pas.
      if (weekStatuses[mondayKey] !== undefined) {
        continue;
      }

      // locked ?
      const locked = dayLockMap[mondayKey] || false;
      if (locked) {
        weekStatuses[mondayKey] = "confirmed";
        continue;
      }

      // shifts ?
      const count = shiftCountMap[mondayKey] || 0;
      if (count > 0) {
        weekStatuses[mondayKey] = "editing";
      } else {
        weekStatuses[mondayKey] = "none";
      }
    }

    return NextResponse.json({ weekStatuses }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/planning/weeksStatus:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
