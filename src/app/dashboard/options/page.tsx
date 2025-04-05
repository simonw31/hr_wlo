"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, CalendarDays, CheckCircle2, Settings, User } from "lucide-react";

import GeneralTab from "./GeneralTab";
import PlanningTab from "./PlanningTab";
import PayPeriodTab from "./PayPeriodTab";
import EmployeeTab from "./EmployeeTab";

export default function OptionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Options</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres & Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            {/* Barre d’onglets */}
            <TabsList>
              <TabsTrigger value="general">
                <Bell className="mr-2 h-4 w-4" />
                Général
              </TabsTrigger>
              <TabsTrigger value="planning">
                <CalendarDays className="mr-2 h-4 w-4" />
                Planning
              </TabsTrigger>
              <TabsTrigger value="pay">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Période de paie
              </TabsTrigger>
              <TabsTrigger value="employee">
                <User className="mr-2 h-4 w-4" />
                Employé
              </TabsTrigger>
            </TabsList>

            {/* Contenus */}
            <TabsContent value="general">
              <GeneralTab />
            </TabsContent>

            <TabsContent value="planning">
              <PlanningTab />
            </TabsContent>

            <TabsContent value="pay">
              <PayPeriodTab />
            </TabsContent>

            <TabsContent value="employee">
              <EmployeeTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
