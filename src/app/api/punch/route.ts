import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getCurrentDateTime() {
  const now = new Date();
  // Ajuste l'heure pour le fuseau horaire local (France)
  const offset = 2; // UTC+2 pour la France
  now.setHours(now.getHours() + offset);
  return now;
}

export async function POST(request: Request) {
  try {
    console.log("=== Début de l'endpoint /api/punch ===");
    const body = await request.json();
    console.log("Body reçu :", body);
    
    const { matricule, action } = body;
    console.log("Matricule :", matricule, "Action :", action);

    if (!matricule) {
      console.error("Matricule non fourni");
      return NextResponse.json(
        { error: "Le matricule est requis" },
        { status: 400 }
      );
    }

    const numericMatricule = parseInt(matricule, 10);
    console.log("Matricule numérique :", numericMatricule);
    if (isNaN(numericMatricule)) {
      console.error("Matricule invalide");
      return NextResponse.json(
        { error: "Matricule invalide" },
        { status: 400 }
      );
    }

    // Recherche de l'employé par son matricule
    const employee = await prisma.employee.findUnique({
      where: { matricule: numericMatricule },
    });
    console.log("Employé trouvé :", employee);
    if (!employee) {
      console.error("Employé introuvable pour le matricule", numericMatricule);
      return NextResponse.json(
        { error: "Employé introuvable" },
        { status: 404 }
      );
    }

    // Si aucune action n'est fournie, renvoie simplement les infos de l'employé
    if (!action) {
      console.log("Aucune action fournie, renvoi des infos de l'employé");
      return NextResponse.json(employee);
    }

    const currentDateTime = getCurrentDateTime();

    if (action === "in") {
      console.log("Traitement de l'action IN");
      const openRecord = await prisma.timeRecord.findFirst({
        where: { employeeId: employee.id, checkOut: null },
      });
      console.log("Record ouvert existant :", openRecord);
      if (openRecord) {
        console.error("Un pointage est déjà ouvert pour cet employé.");
        return NextResponse.json(
          { error: "Un pointage est déjà ouvert pour cet employé." },
          { status: 400 }
        );
      }
      const newRecord = await prisma.timeRecord.create({
        data: {
          employeeId: employee.id,
          date: currentDateTime,
          checkIn: currentDateTime,
          checkOut: null,
        },
      });
      console.log("Nouveau TimeRecord créé :", newRecord);
      return NextResponse.json({ 
        success: true, 
        action: "in",
        timestamp: currentDateTime 
      });
    } else if (action === "out") {
      console.log("Traitement de l'action OUT");
      const openRecord = await prisma.timeRecord.findFirst({
        where: { employeeId: employee.id, checkOut: null },
      });
      console.log("Record ouvert trouvé pour sortie :", openRecord);
      if (!openRecord) {
        console.error("Aucun pointage en cours pour cet employé.");
        return NextResponse.json(
          { error: "Aucun pointage en cours pour cet employé." },
          { status: 400 }
        );
      }
      const updatedRecord = await prisma.timeRecord.update({
        where: { id: openRecord.id },
        data: { checkOut: currentDateTime },
      });
      console.log("TimeRecord mis à jour avec checkOut :", updatedRecord);
      return NextResponse.json({ 
        success: true, 
        action: "out",
        timestamp: currentDateTime 
      });
    } else {
      console.error("Action invalide :", action);
      return NextResponse.json(
        { error: 'L\'action doit être "in" ou "out"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur /api/punch =>", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}