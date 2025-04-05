import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request, context: any) {
  try {
    // Récupération de l'ID de l'employé depuis le contexte
    const id = context.params.id;

    const body = await request.json();
    console.log("=== POST /api/employees/[id]/contract - body ===");
    console.log(body);

    const { contractType, role, hoursPerWeek, status, resignationDate, endDate, availability } = body;

    // Vérifier si un contrat existe déjà pour cet employé avec findFirst (puisque employeeId n'est plus unique)
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
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek, 10) : null,
        status: status || "EN_CONTRAT",
        resignationDate: resignationDate ? new Date(resignationDate) : null,
        // Enregistrer endDate uniquement si le type de contrat est "CDD"
        endDate: contractType === "CDD" && endDate ? new Date(endDate) : null,
        employee: {
          connect: { id },
        },
        availability: {
          create: Array.isArray(availability)
            ? availability.map((avail: any) => ({
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
    return NextResponse.json({ error: "Unable to create contract" }, { status: 500 });
  }
}
