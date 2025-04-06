"use client";

import React from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Clock, 
  Edit3,
  User,
  Calendar,
  Flag,
  MapPin,
  CreditCard,
  Heart,
  Bus,
  Building2
} from "lucide-react";

function copyToClipboard(value?: string | null) {
  if (!value) return;
  navigator.clipboard.writeText(value).then(() => {
    toast.success("Copié dans le presse-papiers !");
  });
}

type AvailabilityInterval = {
  id: string;
  day: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
};

type EmployeeProfileDisplayProps = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    matricule?: number | null;
    dateOfBirth?: string;
    sex?: string | null;
    nationality?: string | null;
    address?: string | null;
    address2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    iban?: string | null;
    bic?: string | null;
    socialSecurityNumber?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    transportMeans?: string | null;
    availabilities: AvailabilityInterval[];
  };
};

type InfoFieldProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
  onCopy: () => void;
};

const InfoField = ({ label, value, icon, fullWidth = false, onCopy }: InfoFieldProps) => (
  <div className={`${fullWidth ? "md:col-span-2" : ""} group animate-fadeIn`}>
    <Label className="text-sm text-gray-500 flex items-center gap-2">
      {icon}
      {label}
    </Label>
    <div className="relative mt-1">
      <Input
        readOnly
        value={value}
        className="pr-10 bg-white"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  </div>
);

export default function EmployeeProfileDisplay({
  employee,
}: EmployeeProfileDisplayProps) {
  const formattedDOB = employee.dateOfBirth
    ? new Date(employee.dateOfBirth).toLocaleDateString()
    : "N/A";

  const addressString = employee.address
    ? `${employee.address}${employee.address2 ? `, ${employee.address2}` : ""}${
        employee.postalCode || employee.city
          ? ` (${employee.postalCode ?? ""} ${employee.city ?? ""})`
          : ""
      }`
    : "N/A";

  return (
    <div className="space-y-6">
      {/* En-tête avec photo */}
      <div className="flex items-center gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={employee.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt={`${employee.firstName} ${employee.lastName}`}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-4 border-white"></div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" />
            Matricule : {employee.matricule || "Non défini"}
          </p>
        </div>
        <Link href={`/dashboard/employees/${employee.id}/edit`}>
          <Button variant="default" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Éditer
          </Button>
        </Link>
      </div>

      {/* Informations personnelles */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Prénom"
              value={employee.firstName || "N/A"}
              icon={<User className="w-4 h-4" />}
              onCopy={() => copyToClipboard(employee.firstName)}
            />
            <InfoField
              label="Nom"
              value={employee.lastName || "N/A"}
              icon={<User className="w-4 h-4" />}
              onCopy={() => copyToClipboard(employee.lastName)}
            />
            <InfoField
              label="Date de naissance"
              value={formattedDOB}
              icon={<Calendar className="w-4 h-4" />}
              onCopy={() => copyToClipboard(formattedDOB)}
            />
            <InfoField
              label="Sexe"
              value={employee.sex || "N/A"}
              icon={<User className="w-4 h-4" />}
              onCopy={() => copyToClipboard(employee.sex)}
            />
            <InfoField
              label="Nationalité"
              value={employee.nationality || "N/A"}
              icon={<Flag className="w-4 h-4" />}
              onCopy={() => copyToClipboard(employee.nationality)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InfoField
            label="Adresse complète"
            value={addressString}
            icon={<MapPin className="w-4 h-4" />}
            fullWidth
            onCopy={() => copyToClipboard(addressString)}
          />
        </CardContent>
      </Card>

      {/* Informations bancaires */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Informations bancaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="IBAN"
              value={employee.iban || "N/A"}
              icon={<CreditCard className="w-4 h-4" />}
              onCopy={() => copyToClipboard(employee.iban)}
            />
            <InfoField
              label="BIC"
              value={employee.bic || "N/A"}
              icon={<CreditCard className="w-4 h-4" />}
              onCopy={() => copyToClipboard(employee.bic)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Santé et urgence */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600" />
            Santé et contact d&apos;urgence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Numéro de sécurité sociale"
              value={employee.socialSecurityNumber || "N/A"}
              icon={<Heart className="w-4 h-4" />}
              fullWidth
              onCopy={() => copyToClipboard(employee.socialSecurityNumber)}
            />
            <InfoField
              label="Contact d'urgence"
              value={employee.emergencyContactName ? `${employee.emergencyContactName} - ${employee.emergencyContactPhone}` : "N/A"}
              icon={<Heart className="w-4 h-4" />}
              fullWidth
              onCopy={() => copyToClipboard(employee.emergencyContactName ? `${employee.emergencyContactName} - ${employee.emergencyContactPhone}` : "")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transport */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Bus className="w-6 h-6 text-blue-600" />
            Transport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InfoField
            label="Moyen de transport"
            value={employee.transportMeans || "N/A"}
            icon={<Bus className="w-4 h-4" />}
            fullWidth
            onCopy={() => copyToClipboard(employee.transportMeans)}
          />
        </CardContent>
      </Card>

      {/* Disponibilités */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Disponibilités
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employee.availabilities.length > 0 ? (
            <div className="grid gap-2">
              {employee.availabilities.map((avail) => (
                <div
                  key={avail.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50/50 transition-colors animate-fadeIn"
                >
                  <Clock className="h-5 w-5 text-blue-600" />
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
            <p className="text-sm text-gray-500">
              Aucune disponibilité renseignée.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}