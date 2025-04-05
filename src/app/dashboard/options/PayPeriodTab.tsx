"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PayPeriod = {
  id?: string;
  startDate: string;
  endDate: string;
  salaryMonth: string;
};

const monthOptions = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function PayPeriodTab() {
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [payStart, setPayStart] = useState("");
  const [payEnd, setPayEnd] = useState("");
  const [salaryMonth, setSalaryMonth] = useState("");

  // Pour l'édition
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [editPayStart, setEditPayStart] = useState("");
  const [editPayEnd, setEditPayEnd] = useState("");
  const [editSalaryMonth, setEditSalaryMonth] = useState("");

  useEffect(() => {
    fetchPayPeriods();
  }, []);

  async function fetchPayPeriods() {
    try {
      const res = await fetch("/api/pay-periods", { method: "GET" });
      if (!res.ok) throw new Error("Erreur lors de la récupération des périodes");
      const data = await res.json();
      setPayPeriods(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddPayPeriod() {
    if (!payStart || !payEnd || !salaryMonth) return;
    try {
      const res = await fetch("/api/pay-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: payStart, endDate: payEnd, salaryMonth }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de la période");
      const newPeriod = await res.json();
      setPayPeriods((prev) => [newPeriod, ...prev]);
      setPayStart("");
      setPayEnd("");
      setSalaryMonth("");
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeletePayPeriod(id: string) {
    try {
      const res = await fetch(`/api/pay-periods/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression de la période");
      setPayPeriods((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  function startEditing(period: PayPeriod) {
    setEditingPeriodId(period.id || null);
    setEditPayStart(period.startDate);
    setEditPayEnd(period.endDate);
    setEditSalaryMonth(period.salaryMonth);
  }

  async function handleUpdatePayPeriod() {
    if (!editingPeriodId || !editPayStart || !editPayEnd || !editSalaryMonth) return;
    try {
      const res = await fetch(`/api/pay-periods/${editingPeriodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: editPayStart,
          endDate: editPayEnd,
          salaryMonth: editSalaryMonth,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de la période");
      const updatedPeriod = await res.json();
      setPayPeriods((prev) =>
        prev.map((p) => (p.id === editingPeriodId ? updatedPeriod : p))
      );
      setEditingPeriodId(null);
      setEditPayStart("");
      setEditPayEnd("");
      setEditSalaryMonth("");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Définissez les périodes de paie (ex : du 21 Janv au 20 Fév, etc.)
      </p>

      {/* Formulaire d'ajout */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="payStart">Début de la période de paie</Label>
          <Input
            id="payStart"
            type="date"
            value={payStart}
            onChange={(e) => setPayStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payEnd">Fin de la période de paie</Label>
          <Input
            id="payEnd"
            type="date"
            value={payEnd}
            onChange={(e) => setPayEnd(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salaryMonth">Mois de salaire</Label>
          <select
            id="salaryMonth"
            className="border p-1 text-sm"
            value={salaryMonth}
            onChange={(e) => setSalaryMonth(e.target.value)}
          >
            <option value="">Sélectionnez un mois</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button onClick={handleAddPayPeriod}>Ajouter une période de paie</Button>

      {/* Liste des périodes existantes */}
      <div className="mt-4 space-y-2">
        <Label className="text-sm font-semibold">Périodes existantes</Label>
        {payPeriods.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune pour l’instant
          </p>
        ) : (
          <ul className="list-disc list-inside text-sm">
            {payPeriods.map((p) => (
              <li key={p.id} className="flex flex-col space-y-1">
                {editingPeriodId === p.id ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="date"
                        value={editPayStart}
                        onChange={(e) => setEditPayStart(e.target.value)}
                      />
                      <Input
                        type="date"
                        value={editPayEnd}
                        onChange={(e) => setEditPayEnd(e.target.value)}
                      />
                      <select
                        className="border p-1 text-sm"
                        value={editSalaryMonth}
                        onChange={(e) => setEditSalaryMonth(e.target.value)}
                      >
                        <option value="">Sélectionnez un mois</option>
                        {monthOptions.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleUpdatePayPeriod}>
                        Enregistrer
                      </Button>
                      <Button variant="destructive" onClick={() => setEditingPeriodId(null)}>
                        Annuler
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>
                      Du {p.startDate} au {p.endDate} - Mois de salaire : {p.salaryMonth}
                    </span>
                    <div className="flex space-x-2">
                      <Button onClick={() => startEditing(p)}>Éditer</Button>
                      <Button
                        variant="destructive"
                        onClick={() => p.id && handleDeletePayPeriod(p.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
