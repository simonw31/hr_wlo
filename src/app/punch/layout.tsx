// app/punch/layout.tsx
import React from "react";
import { Toaster } from "react-hot-toast";

/**
 * Ce layout enveloppe toutes les pages du dossier `punch/`
 * et inclut un <Toaster> global pour que les toasts persistent
 * lors des navigations internes (punch -> confirm, etc.).
 */
export default function PunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {/* Toaster global pour la zone /punch */}
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
