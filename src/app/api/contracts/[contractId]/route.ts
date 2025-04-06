// app/api/contracts/[contractId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
  params: {
    contractId: string;
  };
}

interface AvailabilityInput {
  day: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

interface UpdateContractInput {
  contractType: string;
  role: string;
  hoursPerWeek?: string | number | null;
  status: string;
  resignationDate?: string | null;
  availability?: AvailabilityInput[];
}

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { contractId } = context.params;
    const body = (await request.json()) as UpdateContractInput;
    const { contractType, role, hoursPerWeek, status, resignationDate, availability } = body;

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        contractType,
        role,
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek.toString(), 10) : null,
        status,
        resignationDate: resignationDate ? new Date(resignationDate) : null,
        availability: {
          deleteMany: {},
          create: Array.isArray(availability)
            ? availability.map((a: AvailabilityInput) => ({
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
