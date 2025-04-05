"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Clock from "@/components/clock";
import Keypad from "@/components/keypad";
import { toast } from "sonner";
import { Fingerprint, AlertCircle } from "lucide-react";

export default function PunchPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!code) {
      toast.error("Veuillez saisir votre matricule");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule: code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur s'est produite.");
        toast.error(data.error || "Une erreur s'est produite");
        return;
      }

      await res.json();
      router.push(`/punch/confirm?matricule=${code}`);
    } catch (err) {
      console.error(err);
      setError("Erreur réseau.");
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  function handleDigit(digit: string) {
    if (code.length < 6) {
      setCode((prev) => prev + digit);
    }
  }

  function handleClear() {
    setCode("");
    setError("");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md space-y-8">
        {/* En-tête avec horloge */}
        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg inline-block">
            <Clock />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pointage</h1>
        </div>

        {/* Zone de saisie */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={code}
                readOnly
                placeholder="Saisissez votre matricule"
                className="text-center text-3xl h-16 font-mono tracking-wider bg-gray-50"
              />
              <Fingerprint className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <Keypad onDigit={handleDigit} onClear={handleClear} />

          <Button
            variant="default"
            size="lg"
            onClick={handleSubmit}
            disabled={loading || !code}
            className="w-full h-16 text-xl font-medium relative overflow-hidden group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            ) : (
              <>
                <span className="relative z-10">Valider</span>
                <div className="absolute inset-0 bg-black/10 transform translate-y-full transition-transform group-hover:translate-y-0"></div>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}