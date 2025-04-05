"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2, Edit, Building2, Phone, Mail, MapPin, Briefcase, User } from "lucide-react";

type UserAccount = {
  id: string;
  username: string;
  role: "admin" | "manager";
};

type CompanyInfo = {
  name: string;
  siret: string;
  phone: string;
  email: string;
  address: string;
  apeCode: string;
  director: string;
  logo: string;
};

export default function GeneralTab() {
  // État pour les infos de base
  const [adminName, setAdminName] = useState("Admin Principal");
  const [linkedPointeuse, setLinkedPointeuse] = useState("Pointeuse #12345");
  const [notifHeuresSupp, setNotifHeuresSupp] = useState(true);

  // État pour les informations de l'entreprise
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    siret: "",
    phone: "",
    email: "",
    address: "",
    apeCode: "",
    director: "",
    logo: "",
  });

  // État pour la gestion des comptes
  const [accounts, setAccounts] = useState<UserAccount[]>([
    { id: "1", username: "superAdmin", role: "admin" },
    { id: "2", username: "manager1", role: "manager" },
  ]);

  // Ajout d'un nouveau compte
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager">("manager");

  function handleAddAccount() {
    if (!newUsername.trim()) return;
    const newAcc: UserAccount = {
      id: Math.random().toString(36).slice(2),
      username: newUsername,
      role: newRole,
    };
    setAccounts((prev) => [...prev, newAcc]);
    setNewUsername("");
    setNewRole("manager");
  }

  function handleDeleteAccount(id: string) {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  }

  function handleCompanyInfoChange(field: keyof CompanyInfo, value: string) {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCompanyInfoChange('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="space-y-8">
      {/* Informations de l'entreprise */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
          <Building2 className="w-5 h-5 text-blue-500" />
          Informations de l'entreprise
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="col-span-2 flex items-center gap-4">
            {companyInfo.logo && (
              <img
                src={companyInfo.logo}
                alt="Logo entreprise"
                className="w-16 h-16 object-contain"
              />
            )}
            <div className="flex-1">
              <Label htmlFor="logo">Logo de l'entreprise</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={companyInfo.name}
              onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
              placeholder="Nom de votre entreprise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET</Label>
            <Input
              id="siret"
              value={companyInfo.siret}
              onChange={(e) => handleCompanyInfoChange('siret', e.target.value)}
              placeholder="123 456 789 00012"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              Téléphone
            </Label>
            <Input
              id="phone"
              value={companyInfo.phone}
              onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={companyInfo.email}
              onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
              placeholder="contact@entreprise.fr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              Adresse
            </Label>
            <Input
              id="address"
              value={companyInfo.address}
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
              placeholder="123 rue Example, 75000 Paris"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apeCode" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              Code APE
            </Label>
            <Input
              id="apeCode"
              value={companyInfo.apeCode}
              onChange={(e) => handleCompanyInfoChange('apeCode', e.target.value)}
              placeholder="6201Z"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="director" className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              Directeur
            </Label>
            <Input
              id="director"
              value={companyInfo.director}
              onChange={(e) => handleCompanyInfoChange('director', e.target.value)}
              placeholder="Jean Dupont"
            />
          </div>
        </div>
      </div>

      {/* Paramètres généraux */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <h2 className="text-xl font-semibold">Paramètres généraux</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="adminName">Nom du compte admin</Label>
            <Input
              id="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pointeuse">Pointeuse liée</Label>
            <Input
              id="pointeuse"
              value={linkedPointeuse}
              onChange={(e) => setLinkedPointeuse(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Switch
              checked={notifHeuresSupp}
              onCheckedChange={(val) => setNotifHeuresSupp(val)}
              id="switchNotif"
            />
            <Label htmlFor="switchNotif">Activer notifications heures supp</Label>
          </div>
        </div>
      </div>

      {/* Gestion des comptes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h2 className="text-xl font-semibold">Gestion des comptes</h2>

        {/* Liste des comptes */}
        {accounts.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left">Identifiant</th>
                  <th className="py-2 px-3 text-left">Rôle</th>
                  <th className="py-2 px-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3">{acc.username}</td>
                    <td className="py-2 px-3 capitalize">{acc.role}</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAccount(acc.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun compte pour l'instant.</p>
        )}

        {/* Formulaire d'ajout de compte */}
        <div className="flex flex-wrap items-end gap-2 pt-4 border-t">
          <div className="space-y-1">
            <Label htmlFor="newUsername">Identifiant</Label>
            <Input
              id="newUsername"
              placeholder="Nom d'utilisateur"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Rôle</Label>
            <Select value={newRole} onValueChange={(val) => setNewRole(val as "admin" | "manager")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddAccount} className="mt-4">
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un compte
          </Button>
        </div>
      </div>
    </div>
  );
}