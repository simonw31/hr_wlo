"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Clock from "@/components/clock";
import { toast } from "sonner";
import { 
  LogIn, 
  LogOut, 
  User, 
  Calendar,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

async function fetchEmployeeByMatricule(matricule: string) {
  const res = await fetch("/api/punch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricule }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Employé introuvable");
  }
  return await res.json();
}

export default function ConfirmPunchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [punchLoading, setPunchLoading] = useState(false);

  const matricule = searchParams.get("matricule") || "";

  useEffect(() => {
    async function loadEmployee() {
      setLoading(true);
      try {
        const emp = await fetchEmployeeByMatricule(matricule);
        setEmployee(emp);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (matricule) {
      loadEmployee();
    }
  }, [matricule]);

  async function handlePunch(action: "in" | "out") {
    setPunchLoading(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    try {
      const res = await fetch("/api/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors du pointage");
      }

      await res.json();
      toast.success(
        `${action === "in" ? "Entrée" : "Sortie"} enregistrée à ${timeStr}`,
        { duration: 3000 }
      );

      setTimeout(() => router.push("/punch"), 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPunchLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Clock />
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Clock />
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md w-full">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Erreur</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/punch")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Clock />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md w-full">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900">Employé non trouvé</h3>
              <p className="text-amber-700 mt-1">
                Aucun employé trouvé pour le matricule {matricule}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/punch")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Horloge */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <Clock />
        </div>

        {/* Carte employé */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={employee.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-4 border-white"></div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Matricule : {matricule}</span>
              </div>
              {employee.shift && (
                <div className="flex items-center justify-center gap-2 mt-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Créneau : {employee.shift}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => handlePunch("in")}
              disabled={punchLoading}
              className="h-16 text-lg relative overflow-hidden group"
            >
              {punchLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  <span>Entrée</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePunch("out")}
              disabled={punchLoading}
              className="h-16 text-lg relative overflow-hidden group"
            >
              {punchLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>Sortie</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/punch")}
          className="w-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>
    </div>
  );
}