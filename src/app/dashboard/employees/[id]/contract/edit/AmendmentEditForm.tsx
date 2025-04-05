"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  FileSignature, 
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

export type AmendmentProps = {
  id: string;
  contractId: string;
  startDate: string;
  endDate?: string;
  newHoursPerWeek: number | null;
  isTemporary: boolean;
};

type AmendmentEditFormProps = {
  contractId: string;
  employeeId: string;
  initialData?: AmendmentProps;
};

export default function AmendmentEditForm({
  contractId,
  employeeId,
  initialData,
}: AmendmentEditFormProps) {
  const router = useRouter();

  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [newHoursPerWeek, setNewHoursPerWeek] = useState(
    initialData?.newHoursPerWeek != null ? String(initialData.newHoursPerWeek) : ""
  );
  const [isTemporary, setIsTemporary] = useState(
    initialData?.isTemporary ?? true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !newHoursPerWeek) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (isTemporary && !endDate) {
      toast.error("Veuillez spécifier une date de fin pour un avenant temporaire");
      return;
    }

    const payload = {
      contractId,
      startDate,
      endDate: endDate || null,
      newHoursPerWeek: newHoursPerWeek ? parseInt(newHoursPerWeek, 10) : null,
      isTemporary,
    };

    try {
      const res = await fetch(`/api/contracts/${contractId}/amendments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Avenant créé avec succès");
        router.push(`/dashboard/employees/${employeeId}/contract`);
      } else {
        toast.error("Erreur lors de la création de l'avenant");
      }
    } catch (error) {
      toast.error("Erreur réseau");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-50">
            <FileSignature className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? "Modifier l'avenant" : "Nouvel avenant"}
            </h2>
            <p className="text-gray-500">
              {initialData ? "Modification des termes de l'avenant" : "Création d'un nouvel avenant au contrat"}
            </p>
          </div>
        </div>
      </div>

      {/* Informations de l'avenant */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Période de l'avenant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Type d'avenant</Label>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-500">Temporaire</Label>
                  <Switch
                    checked={isTemporary}
                    onCheckedChange={setIsTemporary}
                  />
                </div>
              </div>
              {isTemporary && (
                <div className="relative animate-fadeIn">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modifications du contrat */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Modifications du contrat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nouvelles heures hebdomadaires</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  value={newHoursPerWeek}
                  onChange={(e) => setNewHoursPerWeek(e.target.value)}
                  className="pl-10"
                  placeholder="35"
                  required
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Important</h4>
                <p className="text-sm text-amber-700 mt-1">
                  La modification des heures de travail prendra effet à partir de la date de début spécifiée.
                  {isTemporary && " Elle sera automatiquement annulée à la date de fin."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Annuler
        </Button>
        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" />
          Enregistrer l'avenant
        </Button>
      </div>
    </form>
  );
}