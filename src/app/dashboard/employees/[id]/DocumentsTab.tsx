"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FilePlus2,
  FileWarning,
  FileSignature,
  ChevronRight,
  Download,
  Eye,
  Clock,
  Search
} from "lucide-react";

type DocumentType = "contract" | "amendment" | "warning" | "certificate";

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  date: string;
  status: "draft" | "final";
}

const DOCUMENT_TYPES = [
  {
    id: "contract",
    icon: FileText,
    label: "Contrat de travail",
    description: "Générer un nouveau contrat de travail",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: "amendment",
    icon: FileSignature,
    label: "Avenant",
    description: "Créer un avenant au contrat",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    id: "warning",
    icon: FileWarning,
    label: "Avertissement",
    description: "Émettre un avertissement",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    id: "certificate",
    icon: FilePlus2,
    label: "Attestation",
    description: "Générer une attestation",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  }
];

export default function DocumentsTab({ employeeId }: { employeeId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  
  // Exemple de documents (à remplacer par les vrais données)
  const [documents] = useState<Document[]>([
    {
      id: "1",
      type: "contract",
      title: "Contrat CDI",
      date: "2024-03-15",
      status: "final"
    },
    {
      id: "2",
      type: "amendment",
      title: "Avenant modification horaire",
      date: "2024-03-10",
      status: "draft"
    }
  ]);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateDocument = (type: DocumentType) => {
    setSelectedType(type);
    console.log(`Générer document de type: ${type}`);
  };

  return (
    <div className="space-y-6">
      {/* Section Nouveau Document */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FilePlus2 className="w-6 h-6 text-blue-600" />
            Générer un nouveau document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOCUMENT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleGenerateDocument(type.id as DocumentType)}
                  className={`group p-4 rounded-lg border transition-all duration-200 
                    ${type.bgColor} ${type.borderColor} hover:shadow-md
                    transform hover:-translate-y-1 active:translate-y-0 active:shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <Icon className={`w-8 h-8 ${type.color}`} />
                    <ChevronRight className={`w-5 h-5 ${type.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <h3 className={`mt-3 font-semibold ${type.color}`}>
                    {type.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section Documents Existants */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Documents existants
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun document trouvé
              </p>
            ) : (
              filteredDocuments.map((doc) => {
                const typeInfo = DOCUMENT_TYPES.find(t => t.id === doc.type);
                const Icon = typeInfo?.icon || FileText;
                
                return (
                  <div
                    key={doc.id}
                    className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200 animate-fadeIn"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${typeInfo?.bgColor}`}>
                        <Icon className={`w-6 h-6 ${typeInfo?.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(doc.date).toLocaleDateString()}
                          </span>
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            doc.status === 'draft' 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {doc.status === 'draft' ? 'Brouillon' : 'Final'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}