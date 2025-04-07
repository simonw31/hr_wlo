import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ShiftInput {
  startHour: string;
  endHour: string;
  shiftType: string;
  employeeId: string;
}

interface Payload {
  date: string;
  shifts: ShiftInput[];
  lock?: boolean;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Payload;
    console.log("Payload reçu :", body);

    const { date, shifts, lock } = body;
    if (!date || !shifts) {
      return NextResponse.json(
        { error: 'Les champs "date" et "shifts" sont requis.' },
        { status: 400 }
      );
    }

    const day = new Date(date);

    // Vérifier si le jour est déjà verrouillé
    const dayLock = await prisma.dayLock.findUnique({ where: { date: day } });
    if (dayLock && dayLock.locked) {
      return NextResponse.json(
        { error: 'Le planning de ce jour est verrouillé.' },
        { status: 403 }
      );
    }

    // Supprimer les shifts existants pour ce jour
    await prisma.shift.deleteMany({ where: { date: day } });

    // Créer les nouveaux shifts en convertissant startHour et endHour en nombres
    await prisma.shift.createMany({
      data: shifts.map((shift: ShiftInput) => ({
        date: day,
        startHour: parseFloat(shift.startHour),
        endHour: parseFloat(shift.endHour),
        shiftType: shift.shiftType,
        employeeId: shift.employeeId,
      })),
    });

    // Si le flag lock est true, verrouiller la journée
    if (lock) {
      await prisma.dayLock.upsert({
        where: { date: day },
        update: { locked: true },
        create: { date: day, locked: true },
      });
    }

    return NextResponse.json(
      { message: "Planning sauvegardé avec succès." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de la sauvegarde du planning :", error);
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
