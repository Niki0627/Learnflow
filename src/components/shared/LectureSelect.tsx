"use client";

import React, { useEffect, useState } from "react";
import { api } from "@lib/api-client";
import type { Lecture } from "@lib/types";

interface LectureSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
}

export default function LectureSelect({ value, onChange, label = "" }: LectureSelectProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<Lecture[]>("lectures/");
        if (!mounted) return;
        setLectures(res || []);
      } catch {
        setLectures([]);
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedText = (() => {
    if (!value) return null;
    const lec = lectures.find((l) => String(l.id) === String(value));
    return lec ? lec.title || `Lecture ${lec.id}` : String(value);
  })();

  return (
    <label className="block w-full">
      {label && <span className="mb-1.5 block text-sm font-bold text-violet-950/75">{label}</span>}
      <div className="relative">
        <select
          className="w-full appearance-none rounded-lg border border-violet-200 bg-white/80 px-4 py-3 text-sm outline-none backdrop-blur-xl transition focus:border-violet-500"
          value={value || ""}
          onChange={(e) => onChange && onChange(e.target.value)}
        >
          <option value="">{selectedText || "Select a lecture"}</option>
          {lectures.map((lec) => (
            <option key={lec.id} value={lec.id}>
              {lec.title || `Lecture ${lec.id}`}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary" />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-400">
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </div>
      </div>
    </label>
  );
}
