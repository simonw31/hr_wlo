import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    // Extraire les champs de l'Employee et les disponibilités
    const {
      firstName,
      lastName,
      sex,
      address,
      address2,
      postalCode,
      city,
      nationality,
      iban,
      bic,
      socialSecurityNumber,
      emergencyContactName,
      emergencyContactPhone,
      transportMeans,
      availabilities, // attend un tableau de disponibilités
    } = body;

    // Récupérer l'employé avec ses contrats afin d'obtenir l'ID du contrat actif (on prend le premier)
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { contracts: { include: { availability: true } } },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // On met à jour l'employé (hors contrat)
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        sex,
        address,
        address2,
        postalCode,
        city,
        nationality,
        iban,
        bic,
        socialSecurityNumber,
        emergencyContactName,
        emergencyContactPhone,
        transportMeans,
      },
    });

    // Si l'employé possède au moins un contrat, on met à jour les disponibilités du premier contrat
    let updatedContract = null;
    if (employee.contracts && employee.contracts.length > 0) {
      const contractId = employee.contracts[0].id;
      updatedContract = await prisma.contract.update({
        where: { id: contractId },
        data: {
          availability: {
            deleteMany: {}, // supprime toutes les disponibilités actuelles
            create: Array.isArray(availabilities)
              ? availabilities.map((avail: any) => ({
                  day: avail.day,
                  allDay: avail.allDay,
                  startTime: avail.allDay ? null : avail.startTime,
                  endTime: avail.allDay ? null : avail.endTime,
                }))
              : [],
          },
        },
        include: { availability: true },
      });
    }

    // Renvoyer l'employé mis à jour et, si existant, le contrat mis à jour
    const result = {
      ...updatedEmployee,
      contract: updatedContract,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur PUT /api/employees/[id]:", error);
    return NextResponse.json({ error: "Unable to update employee" }, { status: 500 });
  }
}
