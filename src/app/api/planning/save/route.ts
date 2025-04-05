// app/api/planning/save/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assure-toi que ce chemin est correct

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Payload reçu :", body); // Pour vérifier ce qui est reçu

    const { date, shifts, lock } = body;
    if (!date || !shifts) {
      return NextResponse.json({ error: 'Les champs "date" et "shifts" sont requis.' }, { status: 400 });
    }

    const day = new Date(date);

    // Vérifier si le jour est déjà verrouillé
    const dayLock = await prisma.dayLock.findUnique({ where: { date: day } });
    if (dayLock && dayLock.locked) {
      return NextResponse.json({ error: 'Le planning de ce jour est verrouillé.' }, { status: 403 });
    }

    // Supprimer les shifts existants pour ce jour
    await prisma.shift.deleteMany({ where: { date: day } });

    // Créer les nouveaux shifts
    await prisma.shift.createMany({
      data: shifts.map((shift: any) => ({
        date: day,
        startHour: shift.startHour,
        endHour: shift.endHour,
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

    return NextResponse.json({ message: "Planning sauvegardé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du planning :", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
