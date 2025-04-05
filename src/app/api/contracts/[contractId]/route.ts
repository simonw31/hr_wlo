// app/api/contracts/[contractId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request, context: any) {
  try {
    const contractId = context.params.contractId; // Extraction depuis context
    const body = await request.json();
    const { contractType, role, hoursPerWeek, status, resignationDate, availability } = body;

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        contractType,
        role,
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek, 10) : null,
        status,
        resignationDate: resignationDate ? new Date(resignationDate) : null,
        availability: {
          deleteMany: {},
          create: Array.isArray(availability)
            ? availability.map((a: any) => ({
                day: a.day,
                allDay: a.allDay,
                startTime: a.allDay ? null : a.startTime,
                endTime: a.allDay ? null : a.endTime,
              }))
            : [],
        },
      },
      include: { availability: true },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error("Erreur PUT /api/contracts/[contractId]:", error);
    return NextResponse.json({ error: "Unable to update contract" }, { status: 500 });
  }
}
