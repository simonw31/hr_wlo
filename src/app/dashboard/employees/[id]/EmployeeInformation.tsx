"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Copy, 
  User, 
  Calendar, 
  Flag,
  MapPin,
  CreditCard,
  Heart,
  Bus,
  CheckCircle2,
  Building2
} from "lucide-react";
import { toast } from "sonner";

function copyToClipboard(value?: string | null) {
  if (!value) return;
  navigator.clipboard.writeText(value).then(() => {
    toast.success("Copié dans le presse-papiers");
  });
}

type EmployeeInformationProps = {
  employee: {
    firstName: string;
    lastName: string;
    matricule: number | null;
    dateOfBirth: string;
    sex: string | null;
    nationality: string | null;
    address: string | null;
    address2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    iban: string | null;
    bic: string | null;
    socialSecurityNumber: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    transportMeans: string | null;
    photoUrl?: string | null;
  };
};

type InfoFieldProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
};

const InfoField = ({ label, value, icon, fullWidth = false, className = "" }: InfoFieldProps) => (
  <div className={`${fullWidth ? "col-span-2" : ""} ${className} group animate-fadeIn`}>
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
        onClick={() => copyToClipboard(value)}
      >
        <Copy className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  </div>
);

export default function EmployeeInformation({ employee }: EmployeeInformationProps) {
  return (
    <div className="space-y-6">
      {/* En-tête avec photo */}
      <div className="flex items-center gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="relative">
          <img
            src={employee.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-4 border-white"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" />
            Matricule : {employee.matricule || "Non défini"}
          </p>
        </div>
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
              value={employee.firstName}
              icon={<User className="w-4 h-4" />}
            />
            <InfoField
              label="Nom"
              value={employee.lastName}
              icon={<User className="w-4 h-4" />}
            />
            <InfoField
              label="Date de naissance"
              value={new Date(employee.dateOfBirth).toLocaleDateString()}
              icon={<Calendar className="w-4 h-4" />}
            />
            <InfoField
              label="Sexe"
              value={employee.sex || "Non défini"}
              icon={<User className="w-4 h-4" />}
            />
            <InfoField
              label="Nationalité"
              value={employee.nationality || "Non défini"}
              icon={<Flag className="w-4 h-4" />}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Adresse"
              value={employee.address || "Non défini"}
              icon={<MapPin className="w-4 h-4" />}
              fullWidth
            />
            {employee.address2 && (
              <InfoField
                label="Complément d&apos;adresse"
                value={employee.address2}
                icon={<MapPin className="w-4 h-4" />}
                fullWidth
              />
            )}
            <InfoField
              label="Code postal"
              value={employee.postalCode || "Non défini"}
              icon={<MapPin className="w-4 h-4" />}
            />
            <InfoField
              label="Ville"
              value={employee.city || "Non défini"}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
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
              value={employee.iban || "Non défini"}
              icon={<CreditCard className="w-4 h-4" />}
            />
            <InfoField
              label="BIC"
              value={employee.bic || "Non défini"}
              icon={<CreditCard className="w-4 h-4" />}
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
              value={employee.socialSecurityNumber || "Non défini"}
              icon={<CheckCircle2 className="w-4 h-4" />}
              fullWidth
            />
            <InfoField
              label="Contact d&apos;urgence"
              value={employee.emergencyContactName || "Non défini"}
              icon={<Heart className="w-4 h-4" />}
            />
            <InfoField
              label="Téléphone d&apos;urgence"
              value={employee.emergencyContactPhone || "Non défini"}
              icon={<Heart className="w-4 h-4" />}
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
            value={employee.transportMeans || "Non défini"}
            icon={<Bus className="w-4 h-4" />}
            fullWidth
          />
        </CardContent>
      </Card>
    </div>
  );
}
