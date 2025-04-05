"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Availability = {
  id: string;
  day: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
};

type ContractProps = {
  id: string;
  contractType: string | null;
  role: string | null;
  hoursPerWeek: number | null;
  status: string | null;
  resignationDate: string; // format "YYYY-MM-DD"
  endDate: string;         // format "YYYY-MM-DD" (pour CDD)
  availability: Availability[];
};

export default function ContractEditForm({
  employeeId,
  contract,
}: {
  employeeId: string;
  contract: ContractProps;
}) {
  const router = useRouter();

  // Champs du contrat
  const [contractType, setContractType] = useState(contract.contractType || "");
  const [role, setRole] = useState(contract.role || "");
  const [hoursPerWeek, setHoursPerWeek] = useState(
    contract.hoursPerWeek ? String(contract.hoursPerWeek) : ""
  );
  const [status, setStatus] = useState(contract.status || "EN_CONTRAT");
  const [resignationDate, setResignationDate] = useState(
    contract.resignationDate || ""
  );
  const [endDate, setEndDate] = useState(contract.endDate || "");

  // Disponibilités
  const [availability, setAvailability] = useState<Availability[]>(
    contract.availability
  );

  const handleAvailabilityChange = (
    index: number,
    field: "allDay" | "startTime" | "endTime",
    value: boolean | string
  ) => {
    setAvailability((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          if (field === "allDay" && value === true) {
            return { ...item, allDay: true, startTime: "", endTime: "" };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleAddAvailability = () => {
    setAvailability((prev) => [
      ...prev,
      {
        id: "",
        day: "Lundi", // par défaut, vous pouvez améliorer en proposant un sélecteur de jour
        allDay: false,
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const handleRemoveAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // On n'envoie endDate que si le type de contrat est CDD
    const payload = {
      employeeId,
      contractId: contract.id, // Si vide, c'est une création
      contractType,
      role,
      hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek, 10) : null,
      status,
      resignationDate: status === "DEMISSION" ? resignationDate : "",
      endDate: contractType === "CDD" ? endDate : "",
      availability,
    };

    try {
      const url = contract.id
        ? `/api/contracts/${contract.id}` // Mise à jour si contrat existe
        : `/api/employees/${employeeId}/contract`; // Création sinon
      const method = contract.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push(`/dashboard/employees/${employeeId}`);
      } else {
        console.error("Erreur lors de la mise à jour du contrat");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {contract.id ? "Éditer le contrat" : "Nouveau contrat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Type de contrat */}
            <div>
              <Label>Type de contrat</Label>
              <Select
                value={contractType}
                onValueChange={(val) => setContractType(val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisissez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rôle */}
            <div>
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(val) => setRole(val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choisissez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employé polyvalent">
                    Employé polyvalent
                  </SelectItem>
                  <SelectItem value="Responsable">Responsable</SelectItem>
                  <SelectItem value="Assistant Manager">
                    Assistant Manager
                  </SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Heures par semaine */}
            <div>
              <Label>Heures par semaine</Label>
              <Input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Statut */}
            <div>
              <Label>Statut</Label>
              <Select value={status} onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN_CONTRAT">En contrat</SelectItem>
                  <SelectItem value="DEMISSION">Démission</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Si statut = DEMISSION, on affiche un champ de date */}
            {status === "DEMISSION" && (
              <div>
                <Label>Date de départ</Label>
                <Input
                  type="date"
                  value={resignationDate}
                  onChange={(e) => setResignationDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {/* Si type de contrat = CDD, on affiche un champ de date de fin */}
            {contractType === "CDD" && (
              <div>
                <Label>Date de fin (CDD)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            )}
          </div>

          {/* Disponibilités */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Disponibilités</h2>
            {availability.map((avail, index) => (
              <div
                key={index}
                className="rounded-md border p-3 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    {avail.day}
                  </Label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={avail.allDay}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "allDay",
                            e.target.checked
                          )
                        }
                        className="mr-1 h-4 w-4"
                      />
                      Toute la journée
                    </label>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveAvailability(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
                {!avail.allDay && (
                  <div className="flex gap-4">
                    <div>
                      <Label>Début</Label>
                      <Input
                        type="time"
                        value={avail.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "startTime",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Fin</Label>
                      <Input
                        type="time"
                        value={avail.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "endTime",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={handleAddAvailability}>
              + Ajouter un créneau
            </Button>
          </div>

          {/* Bouton Sauvegarder */}
          <div className="flex justify-end">
            <Button type="submit" className="px-4 py-2">
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
