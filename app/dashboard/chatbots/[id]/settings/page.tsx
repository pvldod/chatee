"use client";

import { toast } from "react-hot-toast";
import { useState } from "react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementovat ukládání nastavení
      toast.success("Nastavení chatbota bylo úspěšně aktualizováno.");
    } catch (error) {
      toast.error("Nepodařilo se uložit nastavení. Prosím zkuste to znovu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nastavení chatbota</h1>
      <div className="space-y-6">
        {/* TODO: Přidat formulář s nastavením */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? "Ukládám..." : "Uložit nastavení"}
        </button>
      </div>
    </div>
  );
} 