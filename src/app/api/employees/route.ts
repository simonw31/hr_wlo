import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contracts: true, // Si vous voulez inclure la relation contract
      },
    })
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Erreur GET /api/employees:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}


export async function POST(request: Request) {
  try {
    // 1. On lit le corps JSON
    const body = await request.json()

    // 2. On logge tout le body pour voir sa structure exacte
    console.log("=== POST /api/employees - body reçu ===")
    console.log(body)

    // Supposons que votre formulaire envoie :
    // {
    //   "employee": { ...tous les champs Employee... },
    //   "contract": {
    //     "availability": [
    //       { "day": "Lundi", "allDay": true },
    //       ...
    //     ]
    //   }
    // }

    const { employee, contract } = body
    console.log("=== employee ===", employee)
    console.log("=== contract ===", contract)

    if (!employee) {
      console.error("Aucun objet 'employee' trouvé dans le body")
      return NextResponse.json({ error: "Missing employee data" }, { status: 400 })
    }

    // 3. Convertir la date de naissance si elle existe
    let birthDate: Date | undefined
    if (employee.dateOfBirth) {
      const d = new Date(employee.dateOfBirth)
      if (!isNaN(d.getTime())) {
        birthDate = d
      } else {
        console.warn("Date de naissance invalide :", employee.dateOfBirth)
      }
    }

    // 4. Création de l'employé (et du contrat si vous voulez un nested create)
    const newEmployee = await prisma.employee.create({
      data: {
        // Champs du modèle Employee
        firstName: employee.firstName || "Non défini",
        lastName: employee.lastName || "Non défini",
        matricule: employee.matricule ? parseInt(employee.matricule, 10) : null,
        dateOfBirth: birthDate,
        sex: employee.sex || null,
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

        // Si on veut créer un contrat par défaut
        ...(contract && {
          contract: {
            create: {
              // contractType, role, hoursPerWeek, etc. si besoin
              availability: {
                create: contract.availability?.map((avail: any) => ({
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
    })

    // 5. On logge l'employé créé pour confirmer le résultat
    console.log("=== Employé créé avec succès ===")
    console.log(newEmployee)

    return NextResponse.json(newEmployee)
  } catch (error) {
    console.error("Erreur POST /api/employees:", error)
    return NextResponse.json({ error: "Unable to create employee" }, { status: 500 })
  }
}
