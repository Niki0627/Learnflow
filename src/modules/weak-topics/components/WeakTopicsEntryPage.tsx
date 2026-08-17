"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, ChevronDown, Loader2 } from "lucide-react";
import { fetchWeakTopicLectures } from "../api";
import type { WeakTopicLecture } from "../types";

export default function WeakTopicsEntryPage() {
  const [noteId, setNoteId] = useState("");
  const [lectures, setLectures] = useState<WeakTopicLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWeakTopicLectures()
      .then((r) => setLectures(r || []))
      .catch(() => setLectures([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-1.5 text-sm font-bold text-red-600">
          <GraduationCap size={14} /> Weak Topics
        </div>
        <h1 className="text-4xl font-black tracking-tight">Weak Topics Analysis</h1>
        <p className="mt-3 text-lg font-medium text-muted-foreground">
          Select a lecture to identify weak concepts and jump straight into focused practice.
        </p>
      </div>

      <div className="max-w-2xl rounded-3xl border bg-card p-8 shadow-sm">
        <h2 className="text-xl font-black mb-2">Select a Lecture</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose your lecture note and generate a ranked list of weak topics based on your quiz history.
        </p>
        <div className="flex items-stretch gap-4 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px]">
            {loading ? (
              <div className="flex h-12 items-center justify-center rounded-xl border bg-background">
                <Loader2 className="animate-spin text-muted-foreground" size={18} />
              </div>
            ) : (
              <>
                <select
                  value={noteId}
                  onChange={(e) => setNoteId(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border bg-background px-4 pr-10 text-sm font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a lecture...</option>
                  {lectures.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </>
            )}
          </div>
          <button
            onClick={() => noteId && router.push(`/weak-topics/${noteId}`)}
            disabled={!noteId}
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Analyze <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
