// src/app/api/employees/[id]/contract/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface AvailabilityInput {
  day: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

interface ContractInput {
  contractType?: string | null;
  role?: string | null;
  hoursPerWeek?: string | number | null;
  status?: string;
  resignationDate?: string | null;
  endDate?: string | null;
  availability?: AvailabilityInput[];
}

export async function POST(
  request: Request,
  context: unknown
): Promise<NextResponse> {
  // Cast du contexte pour extraire params
  const { params } = context as { params: { id: string } };

  try {
    const id = params.id;
    const body = (await request.json()) as ContractInput;
    console.log("=== POST /api/employees/[id]/contract - body ===");
    console.log(body);

    const {
      contractType,
      role,
      hoursPerWeek,
      status,
      resignationDate,
      endDate,
      availability,
    } = body;

    // Vérifier si un contrat existe déjà pour cet employé
    const existingContract = await prisma.contract.findFirst({
      where: { employeeId: id },
    });

    if (existingContract) {
      console.warn("Un contrat existe déjà pour cet employé, suppression pour forcer la création.");
      // Supprimer d'abord les disponibilités associées
      await prisma.availabilityInterval.deleteMany({
        where: { contractId: existingContract.id },
      });
      // Puis supprimer le contrat
      await prisma.contract.delete({ where: { id: existingContract.id } });
    }

    // Création du contrat pour l'employé, en gérant le champ endDate pour les CDD
    const newContract = await prisma.contract.create({
      data: {
        contractType: contractType || null,
        role: role || null,
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek.toString(), 10) : null,
        status: status || "EN_CONTRAT",
        resignationDate: resignationDate ? new Date(resignationDate) : null,
        // Enregistrer endDate uniquement si le type de contrat est "CDD"
        endDate: contractType === "CDD" && endDate ? new Date(endDate) : null,
        employee: {
          connect: { id },
        },
        availability: {
          create: Array.isArray(availability)
            ? availability.map((avail: AvailabilityInput) => ({
                day: avail.day,
                allDay: avail.allDay,
                startTime: avail.allDay ? null : avail.startTime,
                endTime: avail.allDay ? null : avail.endTime,
              }))
            : [],
        },
      },
      include: {
        availability: true,
      },
    });

    console.log("=== Contrat créé avec succès ===");
    console.log(newContract);

    return NextResponse.json(newContract);
  } catch (error) {
    console.error("Erreur POST /api/employees/[id]/contract:", error);
    const message =
      error instanceof Error ? error.message : "Unable to create contract";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
