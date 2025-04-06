// app/api/time-records/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

interface TimeRecord {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string | null;
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

    // 1) Récupérer les timeRecords pour la plage
    const timeRecords = await prisma.timeRecord.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      // include: { employee: true } si besoin pour construire employeeName
    });

    // 2) Transformer chaque timeRecord en "shift réel"
    const realShifts = (timeRecords as TimeRecord[]).map((tr: TimeRecord) => {
      const checkIn = new Date(tr.checkIn);
      const checkOut = tr.checkOut ? new Date(tr.checkOut) : checkIn;

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
        employeeName: "", // Remplir côté client si besoin
        startHour,
        endHour,
        dateKey,
        shiftType: "real",
        category: "real" as const,
      };
    });

    return NextResponse.json({ realShifts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/time-records error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
