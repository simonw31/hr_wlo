// app/api/planning/lock/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { date, lock } = await request.json();
    if (!date || typeof lock !== "boolean") {
      return NextResponse.json(
        { error: "Les champs 'date' et 'lock' sont requis." },
        { status: 400 }
      );
    }
    const day = new Date(date);
    const updated = await prisma.dayLock.upsert({
      where: { date: day },
      update: { locked: lock },
      create: { date: day, locked: lock },
    });
    return NextResponse.json(
      { message: "Statut de verrouillage mis à jour", locked: updated.locked },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du verrouillage:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
