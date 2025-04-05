"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Calendar,
  Flag,
  MapPin,
  CreditCard,
  Heart,
  Bus,
  Clock,
  Save,
  Plus,
  Trash2,
  Building2
} from "lucide-react";
import { toast } from "sonner";

type AvailabilityInterval = {
  id: string;
  day: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  matricule?: number | null;
  dateOfBirth?: string;
  sex?: "Homme" | "Femme" | null;
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
  photoUrl?: string | null;
  availabilities?: AvailabilityInterval[];
};

const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const Section = ({ title, icon, children }: SectionProps) => (
  <Card className="shadow-sm border-none animate-fadeIn">
    <CardHeader>
      <CardTitle className="text-xl font-semibold flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default function EmployeeEditForm({ employee }: { employee: Employee }) {
  const router = useRouter();

  // États
  const [formData, setFormData] = useState({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    matricule: employee.matricule?.toString() || "",
    dateOfBirth: employee.dateOfBirth || "",
    sex: employee.sex || "",
    nationality: employee.nationality || "",
    address: employee.address || "",
    address2: employee.address2 || "",
    postalCode: employee.postalCode || "",
    city: employee.city || "",
    iban: employee.iban || "",
    bic: employee.bic || "",
    socialSecurityNumber: employee.socialSecurityNumber || "",
    emergencyContactName: employee.emergencyContactName || "",
    emergencyContactPhone: employee.emergencyContactPhone || "",
    transportMeans: employee.transportMeans || "",
  });

  const [availabilities, setAvailabilities] = useState<AvailabilityInterval[]>(
    employee.availabilities || []
  );

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (
    index: number,
    field: keyof AvailabilityInterval,
    value: any
  ) => {
    setAvailabilities(prev =>
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
    setAvailabilities(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        day: "Lundi",
        allDay: false,
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const handleRemoveAvailability = (index: number) => {
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          matricule: formData.matricule ? parseInt(formData.matricule, 10) : null,
          availabilities,
        }),
      });

      if (res.ok) {
        toast.success("Modifications enregistrées");
        router.push(`/dashboard/employees/${employee.id}`);
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur réseau");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête avec photo */}
      <div className="flex items-center gap-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="relative">
          <img
            src={employee.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
            alt={`${formData.firstName} ${formData.lastName}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-4 border-white"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier le profil
          </h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" />
            Matricule : {formData.matricule || "Non défini"}
          </p>
        </div>
      </div>

      {/* Informations personnelles */}
      <Section title="Informations personnelles" icon={<User className="w-6 h-6 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Prénom</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Date de naissance</Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Sexe</Label>
            <Select 
              value={formData.sex} 
              onValueChange={(val) => handleInputChange("sex", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Homme">Homme</SelectItem>
                <SelectItem value="Femme">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nationalité</Label>
            <Input
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Section>

      {/* Adresse */}
      <Section title="Adresse" icon={<MapPin className="w-6 h-6 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Adresse</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Complément d'adresse</Label>
            <Input
              value={formData.address2}
              onChange={(e) => handleInputChange("address2", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Code postal</Label>
            <Input
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Ville</Label>
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Section>

      {/* Informations bancaires */}
      <Section title="Informations bancaires" icon={<CreditCard className="w-6 h-6 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>IBAN</Label>
            <Input
              value={formData.iban}
              onChange={(e) => handleInputChange("iban", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>BIC</Label>
            <Input
              value={formData.bic}
              onChange={(e) => handleInputChange("bic", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Section>

      {/* Santé */}
      <Section title="Santé et contact d'urgence" icon={<Heart className="w-6 h-6 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Numéro de sécurité sociale</Label>
            <Input
              value={formData.socialSecurityNumber}
              onChange={(e) => handleInputChange("socialSecurityNumber", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Contact d'urgence</Label>
            <Input
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Téléphone d'urgence</Label>
            <Input
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Section>

      {/* Transport */}
      <Section title="Transport" icon={<Bus className="w-6 h-6 text-blue-600" />}>
        <div>
          <Label>Moyen de transport</Label>
          <Input
            value={formData.transportMeans}
            onChange={(e) => handleInputChange("transportMeans", e.target.value)}
            className="mt-1"
          />
        </div>
      </Section>

      {/* Disponibilités */}
      <Section title="Disponibilités" icon={<Clock className="w-6 h-6 text-blue-600" />}>
        <div className="space-y-4">
          {availabilities.map((avail, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Jour</Label>
                    <Select
                      value={avail.day}
                      onValueChange={(val) => handleAvailabilityChange(index, "day", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={avail.allDay}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "allDay", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <Label>Toute la journée</Label>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAvailability(index)}
                    className="h-9"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>

              {!avail.allDay && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Début</Label>
                    <Input
                      type="time"
                      value={avail.startTime}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "startTime", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Fin</Label>
                    <Input
                      type="time"
                      value={avail.endTime}
                      onChange={(e) =>
                        handleAvailabilityChange(index, "endTime", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddAvailability}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une disponibilité
          </Button>
        </div>
      </Section>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="gap-2">
          <Save className="w-4 h-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}