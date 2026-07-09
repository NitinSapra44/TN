"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Section } from "@/lib/types";

type Draft = {
  html_content: string;
  is_active: boolean;
  sort_order: number;
};

type ToastState = { message: string; kind: "success" | "error" } | null;

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (cancelled) return;

      if (error) {
        setToast({ message: `Failed to load sections: ${error.message}`, kind: "error" });
      } else {
        setSections(data ?? []);
        if (data && data.length > 0) {
          setSelectedId(data[0].id);
        }
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const selected = sections.find((s) => s.id === selectedId);
    if (selected) {
      setDraft({
        html_content: selected.html_content,
        is_active: selected.is_active,
        sort_order: selected.sort_order,
      });
    } else {
      setDraft(null);
    }
  }, [selectedId, sections]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleSave() {
    if (!selectedId || !draft) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("sections")
      .update({
        html_content: draft.html_content,
        is_active: draft.is_active,
        sort_order: draft.sort_order,
      })
      .eq("id", selectedId)
      .select()
      .single();

    if (error) {
      setSaving(false);
      setToast({ message: `Save failed: ${error.message}`, kind: "error" });
      return;
    }

    setSections((prev) =>
      prev
        .map((s) => (s.id === selectedId ? (data as Section) : s))
        .sort((a, b) => a.sort_order - b.sort_order)
    );

    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Revalidation request failed");
      setToast({ message: "Saved and published.", kind: "success" });
    } catch {
      setToast({
        message: "Saved, but revalidation failed. Changes may take up to an hour to appear.",
        kind: "error",
      });
    }

    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const selected = sections.find((s) => s.id === selectedId) ?? null;

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900">Sections</h1>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedId(section.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 text-sm flex items-center justify-between hover:bg-gray-50 ${
                section.id === selectedId ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <span>{section.name}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  section.is_active ? "bg-green-500" : "bg-gray-300"
                }`}
                title={section.is_active ? "Active" : "Inactive"}
              />
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {!selected || !draft ? (
          <div className="p-8 text-sm text-gray-500">Select a section to edit.</div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-500">/{selected.slug}</p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  Sort order
                  <input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) =>
                      setDraft({ ...draft, sort_order: Number(e.target.value) })
                    }
                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  Active
                  <input
                    type="checkbox"
                    checked={draft.is_active}
                    onChange={(e) =>
                      setDraft({ ...draft, is_active: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                </label>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-black text-white text-sm font-medium px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 min-h-0">
              <textarea
                value={draft.html_content}
                onChange={(e) =>
                  setDraft({ ...draft, html_content: e.target.value })
                }
                spellCheck={false}
                className="h-full w-full resize-none border-r border-gray-200 bg-white p-4 font-mono text-sm focus:outline-none"
              />
              <iframe
                title="Preview"
                srcDoc={draft.html_content}
                sandbox=""
                className="h-full w-full bg-white"
              />
            </div>
          </>
        )}
      </main>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 rounded-md px-4 py-2 text-sm text-white shadow-lg ${
            toast.kind === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
