import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  id: string;
}

interface AvailabilityInput {
  day: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

interface EmployeeUpdateInput {
  firstName: string;
  lastName: string;
  sex: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  nationality: string;
  iban: string;
  bic: string;
  socialSecurityNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  transportMeans: string;
  availabilities?: AvailabilityInput[];
}

export async function PUT(
  request: Request,
  context: unknown
): Promise<NextResponse> {
  const { params } = context as { params: RouteParams };

  try {
    const body = (await request.json()) as EmployeeUpdateInput;
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
      availabilities,
    } = body;

    // Récupérer l'employé avec ses contrats afin d'obtenir l'ID du contrat actif (on prend le premier)
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { contracts: { include: { availability: true } } },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Mise à jour de l'employé (hors contrat)
    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        // Forçage du champ sex pour qu'il corresponde à l'enum "Sex"
        sex: sex as "Homme" | "Femme",
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

    // Mise à jour des disponibilités du premier contrat, s'il existe
    let updatedContract = null;
    if (employee.contracts && employee.contracts.length > 0) {
      const contractId = employee.contracts[0].id;
      updatedContract = await prisma.contract.update({
        where: { id: contractId },
        data: {
          availability: {
            deleteMany: {},
            create: Array.isArray(availabilities)
              ? availabilities.map((avail: AvailabilityInput) => ({
                  day: avail.day as "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche",
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
    const result = {
      ...updatedEmployee,
      contract: updatedContract,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur PUT /api/employees/[id]:", error);
    const message = error instanceof Error ? error.message : "Unable to update employee";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
