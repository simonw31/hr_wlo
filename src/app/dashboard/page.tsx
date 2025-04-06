"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ArrowUpRight, ArrowDownRight, CalendarDays, TrendingUp, Clock, Users, DollarSign } from "lucide-react";

const statsData = [
  { 
    value: "475€", 
    label: "Coût du personnel",
    trend: "up",
    percentage: "+12%",
    icon: <DollarSign className="h-4 w-4 text-emerald-500" />,
    description: "vs. mois dernier"
  },
  { 
    value: "220h", 
    label: "Heures travaillées",
    trend: "down",
    percentage: "-8%",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
    description: "vs. mois dernier"
  },
  { 
    value: "471%", 
    label: "Prévisions vs Réel",
    trend: "up",
    percentage: "+15%",
    icon: <TrendingUp className="h-4 w-4 text-purple-500" />,
    description: "vs. objectif"
  },
  { 
    value: "18h", 
    label: "Heures sup totales",
    trend: "up",
    percentage: "+5%",
    icon: <Users className="h-4 w-4 text-orange-500" />,
    description: "vs. semaine dernière"
  },
];

const employeesOvertime = [
  {
    id: 1,
    name: "John Doe",
    role: "Serveur",
    overtime: "2h",
    status: "warning",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Cuisinier",
    overtime: "4h",
    status: "danger",
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Étudiant / Extra",
    overtime: "6h",
    status: "danger",
  },
  {
    id: 4,
    name: "Emily Davis",
    role: "Manager",
    overtime: "1h",
    status: "success",
  },
  {
    id: 5,
    name: "Robert Brown",
    role: "Barman",
    overtime: "2h",
    status: "warning",
  },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState("week");

  return (
    <div className="space-y-8 p-6">
      {/* En-tête avec titre et période */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex items-center gap-4 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none">
              <SelectValue placeholder="Choisissez une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Période sélectionnée :&nbsp; </span>
            {period === "day"
              ? "Aujourd'hui"
              : period === "week"
              ? "Cette semaine"
              : period === "month"
              ? "Ce mois"
              : "Cette année"}
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, idx) => (
          <Card key={idx} className="overflow-hidden transition-all hover:shadow-lg dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                  {stat.icon}
                </div>
                {stat.trend === "up" ? (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm font-medium">{stat.percentage}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <ArrowDownRight className="h-4 w-4" />
                    <span className="text-sm font-medium">{stat.percentage}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-2xl font-bold">{stat.value}</CardTitle>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aperçu des heures sup */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Heures supplémentaires</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Voir tout
          </button>
        </div>
        <Card className="overflow-hidden dark:bg-gray-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[40%]">Employé</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Heures sup</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeesOvertime.map((emp) => (
                  <TableRow 
                    key={emp.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>
                      <div className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${emp.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          emp.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                      `}>
                        {emp.status === 'success' ? 'Normal' : 
                         emp.status === 'warning' ? 'Attention' : 'Critique'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {emp.overtime}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}