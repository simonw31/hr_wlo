"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function EmployeeProfileMenu() {
  return (
    <Tabs defaultValue="information" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="information">Informations</TabsTrigger>
        <TabsTrigger value="contrat">Contrat</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="information">
        <p className="text-sm text-gray-600">
          ICI, les informations personnelles de l’employé.
        </p>
      </TabsContent>
      <TabsContent value="contrat">
        <p className="text-sm text-gray-600">
          ICI, les informations du contrat.
        </p>
      </TabsContent>
      <TabsContent value="documents">
        <p className="text-sm text-gray-600">
          ICI, les documents de l’employé.
        </p>
      </TabsContent>
    </Tabs>
  )
}
