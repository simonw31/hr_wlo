// app/api/planning/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    if (!dateParam) {
      return NextResponse.json({ error: "Paramètre 'date' manquant." }, { status: 400 });
    }
    const day = new Date(dateParam);
    const shifts = await prisma.shift.findMany({
      where: { date: day },
    });
    console.log("GET /api/planning:", { date: dateParam, shifts }); // Log côté serveur
    return NextResponse.json({ shifts }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/planning:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
