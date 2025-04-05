"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Clock, 
  Edit3, 
  FileSignature, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import AmendmentList from "@/components/AmendmentList";

type ContractDisplayProps = {
  employeeId: string;
  contract?: {
    id: string;
    contractType: string | null;
    role: string | null;
    hoursPerWeek: number | null;
    status: string | null;
    resignationDate?: string | null;
    availability: {
      id: string;
      day: string;
      allDay: boolean;
      startTime?: string;
      endTime?: string;
    }[];
  };
};

const STATUS_STYLES = {
  EN_CONTRAT: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle2,
  },
  DEMISSION: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
  },
  AUTRE: {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: AlertCircle,
  },
};

export default function ContractDisplay({ employeeId, contract }: ContractDisplayProps) {
  if (!contract) {
    return (
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Contrat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun contrat
            </h3>
            <p className="text-gray-500 mb-6">
              Cet employé n'a pas encore de contrat enregistré.
            </p>
            <Link href={`/dashboard/employees/${employeeId}/contract/new`}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Créer un contrat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_STYLES[contract.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.AUTRE;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* ... Vos affichages existants du contrat */}
      {/* Historique des avenants */}
      <AmendmentList contractId={contract.id} />
      {/* En-tête avec statut */}
      <div className="flex items-center justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-50">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {contract.contractType || "Type non défini"}
            </h2>
            <p className="text-gray-500">{contract.role || "Rôle non défini"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} flex items-center gap-2`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {contract.status === "EN_CONTRAT" ? "En contrat" : 
               contract.status === "DEMISSION" ? "Démission" : 
               "Autre statut"}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/employees/${employeeId}/contract/amendment/new`}>
              <Button variant="outline" className="gap-2">
                <FileSignature className="w-4 h-4" />
                Créer un avenant
              </Button>
            </Link>
            <Link href={`/dashboard/employees/${employeeId}/contract/edit`}>
              <Button className="gap-2">
                <Edit3 className="w-4 h-4" />
                Modifier
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Détails du contrat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations principales */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Informations principales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type de contrat</p>
                <p className="font-medium mt-1">{contract.contractType || "Non défini"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="font-medium mt-1">{contract.role || "Non défini"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Heures hebdomadaires</p>
                <p className="font-medium mt-1">{contract.hoursPerWeek ? `${contract.hoursPerWeek}h` : "Non défini"}</p>
              </div>
              {contract.status === "DEMISSION" && contract.resignationDate && (
                <div>
                  <p className="text-sm text-gray-500">Date de départ</p>
                  <p className="font-medium mt-1">
                    {new Date(contract.resignationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disponibilités */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Disponibilités
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contract.availability.length > 0 ? (
              <div className="space-y-2">
                {contract.availability.map((avail) => (
                  <div
                    key={avail.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50/50 transition-colors animate-fadeIn"
                  >
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="font-medium">{avail.day}</span>
                      <span className="text-gray-500 ml-2">
                        {avail.allDay
                          ? "Disponible toute la journée"
                          : `${avail.startTime} - ${avail.endTime}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">
                Aucune disponibilité renseignée
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}