import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

// Interface correspondant aux données renvoyées par Prisma
interface TimeRecordFromDB {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  employeeId: string;
  date: Date;
  checkIn: Date;
  checkOut: Date | null;
}

// Interface utilisée pour la réponse finale (si besoin)
interface TimeRecord {
  id: string;
  employeeId: string;
  checkIn: number; // heure décimale
  endHour: number;
  dateKey: string;
  shiftType: string;
  // éventuellement d'autres propriétés...
}

/**
 * Récupère les timeRecords pour la plage [start, end],
 * puis les transforme en shifts "réels" (shiftType="real").
 * Ex: GET /api/time-records?start=2025-03-01&end=2025-03-31
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Les paramètres 'start' et 'end' sont requis." },
        { status: 400 }
      );
    }

    const start = parseISO(startParam);
    const end = parseISO(endParam);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Format de date invalide" },
        { status: 400 }
      );
    }

    // Récupérer les timeRecords pour la plage
    const timeRecordsFromDB = (await prisma.timeRecord.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      // Vous pouvez inclure d'autres relations si nécessaire
    })) as TimeRecordFromDB[];

    // Transformer chaque timeRecord en shift "réel"
    const realShifts: TimeRecord[] = timeRecordsFromDB.map((tr) => {
      // Utiliser directement les Dates renvoyées par Prisma
      const checkIn = tr.checkIn;
      const checkOut = tr.checkOut ? tr.checkOut : checkIn;

      const startHour = parseFloat(
        (checkIn.getUTCHours() + checkIn.getUTCMinutes() / 60).toFixed(2)
      );
      const endHour = parseFloat(
        (checkOut.getUTCHours() + checkOut.getUTCMinutes() / 60).toFixed(2)
      );

      const dateKey = checkIn.toISOString().split("T")[0];

      return {
        id: tr.id,
        employeeId: tr.employeeId,
        checkIn: startHour,
        endHour,
        dateKey,
        shiftType: "real",
      };
    });

    return NextResponse.json({ realShifts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/time-records error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
