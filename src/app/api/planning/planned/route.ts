// app/api/planning/planned/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

/**
 * Récupère les shifts planifiés (table Shift) pour la plage [start, end],
 * en excluant shiftType="real".
 * Ex: GET /api/planning/planned?start=2025-03-01&end=2025-03-31
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

    // 1) Récupérer les shifts planifiés (shiftType != 'real')
    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        shiftType: {
          not: "real",
        },
      },
      // include: { employee: true } si tu veux construire employeeName
    });

    // 2) Transformer le résultat pour respecter la structure Shift
    const plannedShifts = shifts.map((s) => {
      const dateKey = s.date.toISOString().split("T")[0];
      return {
        id: s.id,
        employeeId: s.employeeId,
        employeeName: "", // ou `${s.employee.firstName} ${s.employee.lastName}`
        startHour: s.startHour,
        endHour: s.endHour,
        dateKey,
        shiftType: s.shiftType || "planned",
        category: "planned" as const,
      };
    });

    return NextResponse.json({ plannedShifts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/planning/planned error:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}
