// app/api/time-records/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Création d’un timeRecord si params.id === "create"
 * Sinon, on renvoie une erreur 404
 */
export async function POST(
  request: NextRequest,
  context: unknown
): Promise<NextResponse> {
  // Extraction du paramètre depuis le contexte
  const { params } = context as { params: { id: string } };

  try {
    if (params.id !== "create") {
      return NextResponse.json(
        { error: "Route invalide. Utilisez /api/time-records/create pour POST." },
        { status: 404 }
      );
    }

    const { employeeId, date, checkIn, checkOut } = await request.json();

    if (!employeeId || !date || !checkIn) {
      return NextResponse.json(
        { error: "employeeId, date, checkIn sont requis" },
        { status: 400 }
      );
    }

    // Conversion en Date
    const checkInDate = new Date(checkIn);
    let checkOutDate: Date | null = null;
    if (checkOut) {
      checkOutDate = new Date(checkOut);
    }

    // Création en base
    const newRecord = await prisma.timeRecord.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn: checkInDate,
        checkOut: checkOutDate,
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("POST /time-records/[id]?id=create error:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la création du timeRecord" },
      { status: 500 }
    );
  }
}

/**
 * Mise à jour d’un timeRecord (PUT) quand params.id est un ID
 */
export async function PUT(
  request: NextRequest,
  context: unknown
): Promise<NextResponse> {
  const { params } = context as { params: { id: string } };

  try {
    // Exemple de code existant pour PUT
    const { startHour, endHour } = await request.json();
    const recordId = params.id;

    const timeRecord = await prisma.timeRecord.findUnique({
      where: { id: recordId },
    });
    if (!timeRecord) {
      return NextResponse.json({ error: "TimeRecord introuvable" }, { status: 404 });
    }

    const dateOnly = new Date(timeRecord.date);

    const newCheckIn = new Date(dateOnly);
    newCheckIn.setUTCHours(
      Math.floor(startHour),
      Math.round((startHour % 1) * 60),
      0,
      0
    );

    const newCheckOut = new Date(dateOnly);
    newCheckOut.setUTCHours(
      Math.floor(endHour),
      Math.round((endHour % 1) * 60),
      0,
      0
    );

    const updated = await prisma.timeRecord.update({
      where: { id: recordId },
      data: {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("PUT /time-records/[id] error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

/**
 * Suppression d’un timeRecord (DELETE) quand params.id est un ID
 */
export async function DELETE(
  request: NextRequest,
  context: unknown
): Promise<NextResponse> {
  const { params } = context as { params: { id: string } };

  try {
    const recordId = params.id;
    const existing = await prisma.timeRecord.findUnique({ where: { id: recordId } });
    if (!existing) {
      return NextResponse.json({ error: "TimeRecord introuvable" }, { status: 404 });
    }

    await prisma.timeRecord.delete({ where: { id: recordId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /time-records/[id] error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
