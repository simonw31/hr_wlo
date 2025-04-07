import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface AvailabilityInput {
  day: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

interface EmployeeInput {
  firstName?: string;
  lastName?: string;
  matricule?: string;
  dateOfBirth?: string;
  sex?: string;
  nationality?: string;
  address?: string;
  address2?: string;
  postalCode?: string;
  city?: string;
  iban?: string;
  bic?: string;
  socialSecurityNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  transportMeans?: string;
}

interface ContractInput {
  availability?: AvailabilityInput[];
}

interface EmployeePostInput {
  employee: EmployeeInput;
  contract?: ContractInput;
}

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contracts: true, // Si vous voulez inclure la relation contract
      },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Erreur GET /api/employees:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. On lit le corps JSON et on le typifie
    const body = (await request.json()) as EmployeePostInput;

    // 2. Log du body pour vérifier la structure
    console.log("=== POST /api/employees - body reçu ===");
    console.log(body);

    const { employee, contract } = body;
    console.log("=== employee ===", employee);
    console.log("=== contract ===", contract);

    if (!employee) {
      console.error("Aucun objet 'employee' trouvé dans le body");
      return NextResponse.json({ error: "Missing employee data" }, { status: 400 });
    }

    // 3. Conversion de la date de naissance si présente
    let birthDate: Date | undefined;
    if (employee.dateOfBirth) {
      const d = new Date(employee.dateOfBirth);
      if (!isNaN(d.getTime())) {
        birthDate = d;
      } else {
        console.warn("Date de naissance invalide :", employee.dateOfBirth);
      }
    }

    // 4. Création de l'employé et du contrat associé (si présent)
    const newEmployee = await prisma.employee.create({
      data: {
        firstName: employee.firstName || "Non défini",
        lastName: employee.lastName || "Non défini",
        matricule: employee.matricule ? parseInt(employee.matricule, 10) : null,
        dateOfBirth: birthDate,
        sex: employee.sex ? (employee.sex as "Homme" | "Femme") : null,
        nationality: employee.nationality || null,
        address: employee.address || null,
        address2: employee.address2 || null,
        postalCode: employee.postalCode || null,
        city: employee.city || null,
        iban: employee.iban || null,
        bic: employee.bic || null,
        socialSecurityNumber: employee.socialSecurityNumber || null,
        emergencyContactName: employee.emergencyContactName || null,
        emergencyContactPhone: employee.emergencyContactPhone || null,
        transportMeans: employee.transportMeans || null,

        // Création du contrat par défaut si des données de contrat sont fournies
        ...(contract && {
          contract: {
            create: {
              availability: {
                create: contract.availability?.map((avail: AvailabilityInput) => ({
                  day: avail.day,
                  allDay: avail.allDay,
                  startTime: avail.allDay ? null : avail.startTime,
                  endTime: avail.allDay ? null : avail.endTime,
                })),
              },
            },
          },
        }),
      },
      include: {
        contracts: {
          include: {
            availability: true,
          },
        },
      },
    });

    console.log("=== Employé créé avec succès ===");
    console.log(newEmployee);

    return NextResponse.json(newEmployee);
  } catch (error) {
    console.error("Erreur POST /api/employees:", error);
    return NextResponse.json({ error: "Unable to create employee" }, { status: 500 });
  }
}
