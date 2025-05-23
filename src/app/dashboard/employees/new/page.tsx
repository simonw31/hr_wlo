"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type DayAvailability = {
  day: string
  allDay: boolean
  startTime: string
  endTime: string
}

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
]

export default function NewEmployeePage() {
  const router = useRouter()

  // Champs Employee
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [matricule, setMatricule] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [sex, setSex] = useState<"Homme" | "Femme" | "">("")
  const [nationality, setNationality] = useState("")
  const [address, setAddress] = useState("")
  const [address2, setAddress2] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [iban, setIban] = useState("")
  const [bic, setBic] = useState("")
  const [socialSecurityNumber, setSocialSecurityNumber] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  const [transportMeans, setTransportMeans] = useState("")

  // Disponibilit&eacute;s (jour par jour)
  // On initialise un tableau de 7 objets (un par jour)
  const [availability, setAvailability] = useState<DayAvailability[]>(
    daysOfWeek.map((day) => ({
      day,
      allDay: false,
      startTime: "",
      endTime: "",
    }))
  )

  // Handler : cocher/d&eacute;cocher "Disponible toute la journ&eacute;e"
  const handleAllDayChange = (index: number, checked: boolean) => {
    setAvailability((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            allDay: checked,
            startTime: checked ? "" : item.startTime,
            endTime: checked ? "" : item.endTime,
          }
        }
        return item
      })
    )
  }

  // Handler : modifier startTime ou endTime
  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value }
        }
        return item
      })
    )
  }

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Construction du payload pour l&#39;API
    // On convertit matricule en nombre si non vide
    const parsedMatricule = matricule ? parseInt(matricule) : undefined

    // On pr&eacute;pare un objet "employee" + "contract" (pour les disponibilit&eacute;s)
    const payload = {
      employee: {
        firstName,
        lastName,
        // Si le champ est vide, on envoie null
        matricule: parsedMatricule || null,
        dateOfBirth: dateOfBirth || null,
        sex: sex || null,
        nationality: nationality || null,
        address: address || null,
        address2: address2 || null,
        postalCode: postalCode || null,
        city: city || null,
        iban: iban || null,
        bic: bic || null,
        socialSecurityNumber: socialSecurityNumber || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        transportMeans: transportMeans || null,
      },
      contract: {
        // Contrat minimal, vous pouvez ajouter role, status, etc. si vous voulez
        availability: availability.map((avail) => ({
          day: avail.day,
          allDay: avail.allDay,
          startTime: avail.allDay ? null : avail.startTime,
          endTime: avail.allDay ? null : avail.endTime,
        })),
      },
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        // Redirection vers la liste ou la page de l&#39;employ&eacute;
        router.push("/dashboard/employees")
      } else {
        console.error("Erreur lors de la cr&eacute;ation du salari&eacute;")
      }
    } catch (error) {
      console.error("Erreur r&eacute;seau :", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow p-4 space-y-4">
        <CardHeader>
          <CardTitle className="text-xl">Nouveau salari&eacute;</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coordonn&eacute;es */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pr&eacute;nom</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <Label>Matricule</Label>
              <Input
                type="number"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
              />
            </div>
            <div>
              <Label>Date de naissance</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div>
              <Label>Sexe</Label>
              <Select
                value={sex}
                onValueChange={(val: "Homme" | "Femme") => setSex(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nationalit&eacute;</Label>
              <Input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Adresse</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Compl&eacute;ment d&apos;adresse</Label>
              <Input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </div>
            <div>
              <Label>Code postal</Label>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div>
              <Label>Ville</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>

          {/* Informations bancaires */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>IBAN</Label>
              <Input value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
            <div>
              <Label>BIC</Label>
              <Input value={bic} onChange={(e) => setBic(e.target.value)} />
            </div>
          </div>

          {/* Sant&eacute; */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Num&eacute;ro de s&eacute;curit&eacute; sociale</Label>
              <Input
                value={socialSecurityNumber}
                onChange={(e) => setSocialSecurityNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Personne &agrave; contacter</Label>
              <Input
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
            </div>
            <div>
              <Label>Num&eacute;ro d&apos;urgence</Label>
              <Input
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Divers */}
          <div>
            <Label>Moyen de transport</Label>
            <Input
              value={transportMeans}
              onChange={(e) => setTransportMeans(e.target.value)}
            />
          </div>

          {/* Disponibilit&eacute;s (jour par jour) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Disponibilit&eacute;s</h2>
            {availability.map((avail) => (
              <div
                key={avail.day}
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
                          handleAllDayChange(
                            availability.indexOf(avail),
                            e.target.checked
                          )
                        }
                        className="mr-1 h-4 w-4"
                      />
                      Disponible toute la journ&eacute;e
                    </label>
                  </div>
                </div>
                {!avail.allDay && (
                  <div className="flex gap-4">
                    <div>
                      <Label>D&eacute;but</Label>
                      <Input
                        type="time"
                        value={avail.startTime}
                        onChange={(e) =>
                          handleTimeChange(
                            availability.indexOf(avail),
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
                          handleTimeChange(
                            availability.indexOf(avail),
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
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="px-4 py-2">
              Cr&eacute;er le salari&eacute;
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
