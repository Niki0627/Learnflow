"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ClipboardPaste as ContentPasteIcon,
  NotebookText as NotesIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchNotes, createNote, updateNote, deleteNote } from "../api";
import type { StickyNote } from "../types";

const NOTE_COLORS = [
  { hex: "#f9edca", label: "Sand" },
  { hex: "#c7ece9", label: "Teal" },
  { hex: "#fde3c5", label: "Clay" },
  { hex: "#fad5cc", label: "Coral" },
  { hex: "#d6e3e7", label: "Ink" },
];

const NOTE_TYPES = [
  { value: "lecture", label: "Lecture Note" },
  { value: "hint", label: "Hint" },
  { value: "exam", label: "Exam Note" },
  { value: "formula", label: "Formula" },
];

const ColorPicker = ({ value, onChange }: { value: string; onChange: (hex: string) => void }) => (
  <div className="flex flex-wrap gap-1">
    {NOTE_COLORS.map((c) => (
      <button
        key={c.hex}
        type="button"
        title={c.label}
        onClick={() => onChange(c.hex)}
        className="h-5 w-5 rounded-full transition-transform hover:scale-110"
        style={{
          backgroundColor: c.hex,
          border: value === c.hex ? "2px solid #5B4FE9" : "2px solid transparent",
          outline: value === c.hex ? "1px solid #5B4FE9" : "none",
        }}
      />
    ))}
  </div>
);

const TypeSelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-wrap gap-0.5">
    {NOTE_TYPES.map((t) => (
      <button
        key={t.value}
        type="button"
        onClick={() => onChange(t.value)}
        className="rounded-full px-2 py-0.5 text-[0.7rem] font-bold transition-colors"
        style={{
          backgroundColor: value === t.value ? "#5B4FE9" : "rgba(91,79,233,0.08)",
          color: value === t.value ? "#fff" : "#16112F",
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

const NotesSidebar = ({ lectureId }: { lectureId: number | string }) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [examMode, setExamMode] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#f9edca");
  const [noteType, setNoteType] = useState("lecture");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editColor, setEditColor] = useState("#f9edca");
  const [editNoteType, setEditNoteType] = useState("lecture");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotes(lectureId);
    setNotes(data);
    setLoading(false);
  }, [lectureId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const handler = (e: Event & { detail?: { text?: string } }) => {
      const text = e?.detail?.text || (window as unknown as Record<string, unknown>).lastSelectedPdfText;
      if (text) {
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
        setCreating(true);
      }
    };
    window.addEventListener("lf:pdf-selection", handler as EventListener);
    return () => window.removeEventListener("lf:pdf-selection", handler as EventListener);
  }, []);

  const handleCreate = async () => {
    if (!content.trim()) return;
    try {
      const data = await createNote({
        title: title.trim() || "Untitled Note",
        content,
        color,
        note_type: noteType,
        lecture_note_id: lectureId,
      });
      setNotes((prev) => [data, ...prev]);
      setTitle(""); setContent(""); setColor("#f9edca"); setNoteType("lecture"); setCreating(false);
    } catch {
      // Keep draft open so user can retry
    }
  };

  const handleStartEdit = (note: StickyNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditColor(note.color);
    setEditNoteType(note.note_type || "lecture");
  };

  const handleSaveEdit = async (noteId: number) => {
    try {
      const data = await updateNote(noteId, {
        title: editTitle,
        content: editContent,
        color: editColor,
        note_type: editNoteType,
      });
      setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...data } : n)));
      setEditingId(null);
    } catch {
      // Keep edit mode active so user can retry
    }
  };

  const handleDelete = async (noteId: number) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // Leave note visible if deletion fails
    }
  };

  const handleGrabText = (setContentFunc: React.Dispatch<React.SetStateAction<string>>) => {
    const selected = window.getSelection()?.toString() || (window as unknown as Record<string, unknown>).lastSelectedPdfText;
    if (selected) {
      setContentFunc((prev) => prev + (prev ? "\n\n" : "") + (selected as string));
    } else {
      alert("No text selected from PDF!");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <NotesIcon size={18} className="text-primary" />
          <span className="font-extrabold">Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExamMode(!examMode)}
            className="rounded-full px-2 py-0.5 text-[0.7rem] font-bold transition-colors"
            style={{
              backgroundColor: examMode ? "rgba(91,79,233,0.11)" : "rgba(91,79,233,0.05)",
              color: examMode ? "#3124B8" : "#16112F",
              border: "1px solid rgba(91,79,233,0.2)",
            }}
          >
            Exam Mode
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-md bg-primary px-1.5 py-1 text-xs font-bold text-white"
          >
            Add
          </button>
        </div>
      </div>

      {creating && (
        <div className="mb-2 rounded-lg border-2 border-primary bg-white p-2">
          <TypeSelector value={noteType} onChange={setNoteType} />
          <div className="my-1.5 space-y-1.5">
            <input
              className="w-full rounded-lg border border-violet-200 bg-white/80 px-3 py-1.5 text-sm outline-none focus:border-primary"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-violet-200 bg-white/80 px-3 py-1.5 text-sm outline-none focus:border-primary"
              rows={4}
              placeholder="Type here or drag text from PDF..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedText = e.dataTransfer.getData("text");
                if (droppedText) setContent((prev) => prev + (prev ? "\n\n" : "") + droppedText);
              }}
            />
            <div className="mb-1 flex items-center justify-between">
              <ColorPicker value={color} onChange={setColor} />
              <button
                type="button"
                onClick={() => handleGrabText(setContent)}
                title="Grab selected text from PDF"
                className="rounded-md p-1 text-primary hover:bg-violet-100/70"
              >
                <ContentPasteIcon size={16} />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => { setCreating(false); setContent(""); setTitle(""); }}
              className="rounded-md px-2 py-1 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!content.trim()}
              className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent text-primary" />
        </div>
      )}
      {!loading && notes.length === 0 && !creating && (
        <div className="py-4 text-center">
          <NotesIcon size={48} className="mx-auto mb-1 opacity-50 text-violet-200" />
          <p className="text-sm text-violet-500">No notes yet. Add one!</p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="space-y-2">
          {notes
            .filter((n) => !examMode || n.note_type === "exam")
            .map((note) => (
              <div key={note.id}>
                {editingId === note.id ? (
                  <div className="rounded-lg border-2 border-primary bg-white p-2">
                    <TypeSelector value={editNoteType} onChange={setEditNoteType} />
                    <div className="my-1 space-y-1">
                      <input
                        className="w-full rounded-lg border border-violet-200 px-3 py-1.5 text-sm outline-none"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full rounded-lg border border-violet-200 px-3 py-1.5 text-sm outline-none"
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                      <ColorPicker value={editColor} onChange={setEditColor} />
                      <button
                        type="button"
                        onClick={() => handleGrabText(setEditContent)}
                        className="rounded-md p-1 text-primary hover:bg-violet-100/70"
                      >
                        <ContentPasteIcon size={16} />
                      </button>
                    </div>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(note.id)}
                        className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
                    style={{ borderColor: "rgba(91,79,233,0.14)" }}
                  >
                    <div
                      className="flex items-center justify-between px-1.5 py-1"
                      style={{ backgroundColor: note.color }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold" style={{ color: "rgba(0,0,0,0.8)" }}>
                          {note.title || "Untitled"}
                        </p>
                        <p className="text-[0.65rem] font-bold uppercase" style={{ color: "rgba(0,0,0,0.6)" }}>
                          {note.note_type}
                        </p>
                      </div>
                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(note)}
                          className="rounded p-0.5 text-black/50 hover:text-black/80"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          className="rounded p-0.5 text-black/50 hover:text-red-500"
                        >
                          <DeleteIcon size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-1.5 text-sm leading-relaxed text-violet-700 markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default NotesSidebar;
