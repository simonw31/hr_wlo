"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileSignature,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  History,
  CheckCircle2,
  TimerOff,
} from "lucide-react";

type Amendment = {
  id: string;
  startDate: string;
  endDate?: string;
  newHoursPerWeek: number | null;
  isTemporary: boolean;
};

type AmendmentListProps = {
  contractId: string;
};

export default function AmendmentList({ contractId }: AmendmentListProps) {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmendments = async () => {
      try {
        const res = await fetch(`/api/contracts/${contractId}/amendments`);
        if (!res.ok)
          throw new Error("Erreur lors du chargement des avenants");
        const data = await res.json();
        setAmendments(data);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les avenants");
        console.error("Erreur lors du chargement des avenants", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmendments();
  }, [contractId]);

  const handleDelete = async (amendmentId: string) => {
    try {
      const res = await fetch(
        `/api/contracts/${contractId}/amendments/${amendmentId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setAmendments((prev) => prev.filter((a) => a.id !== amendmentId));
        toast.success("Avenant supprimé avec succès");
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de l&apos;avenant");
      console.error("Erreur réseau lors de la suppression :", error);
    }
  };

  const confirmDelete = (amendmentId: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet avenant ?")) {
      handleDelete(amendmentId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-900">Erreur</h4>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (amendments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <History className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun avenant
        </h3>
        <p className="text-gray-500">
          Aucun avenant n&apos;a été enregistré pour ce contrat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Historique des avenants</h2>
      </div>

      <div className="grid gap-4">
        {amendments.map((amendment) => {
          const startDate = format(
            new Date(amendment.startDate),
            "d MMMM yyyy",
            { locale: fr }
          );
          const endDate = amendment.endDate
            ? format(new Date(amendment.endDate), "d MMMM yyyy", {
                locale: fr,
              })
            : null;

          const isActive =
            new Date(amendment.startDate) <= new Date() &&
            (!amendment.endDate || new Date(amendment.endDate) >= new Date());

          return (
            <Card
              key={amendment.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeIn"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      amendment.isTemporary ? "bg-amber-50" : "bg-emerald-50"
                    }`}
                  >
                    {amendment.isTemporary ? (
                      <TimerOff className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {amendment.isTemporary
                        ? "Avenant temporaire"
                        : "Avenant permanent"}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {isActive
                        ? "En cours"
                        : amendment.endDate &&
                          new Date(amendment.endDate) < new Date()
                        ? "Terminé"
                        : "À venir"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirmDelete(amendment.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Période</p>
                      <p className="font-medium">
                        {startDate}
                        {endDate && ` - ${endDate}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Heures hebdomadaires
                      </p>
                      <p className="font-medium">
                        {amendment.newHoursPerWeek !== null
                          ? `${amendment.newHoursPerWeek}h`
                          : "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                {isActive && (
                  // Désactiver ESLint pour cette ligne pour échapper l'apostrophe
                  // eslint-disable-next-line react/no-unescaped-entities
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700">
                      Cet avenant est actuellement en vigueur
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
