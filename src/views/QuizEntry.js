import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, BookOpen, Clock, Loader2, Check, Brain } from "lucide-react";
import { cn } from "../lib/utils";

const TIMER_OPTIONS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "∞", value: 0 },
];

export default function QuizEntry() {
  const { api: API } = useAuth();
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [timerDuration, setTimerDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [fetchingLectures, setFetchingLectures] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get("lectures/");
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setLectures(data);
      } catch { setLectures([]); }
      finally { setFetchingLectures(false); }
    })();
  }, [API]);

  const handleToggleLecture = (id) => {
    setSelectedNoteIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const startQuiz = () => {
    if (selectedNoteIds.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/quiz-mode?noteIds=${selectedNoteIds.join(",")}&n=${numQuestions}`, { state: { timerDuration } });
    }, 500);
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Practice Arena</p>
        <h1 className="text-4xl font-black tracking-tight">Test Your Knowledge</h1>
        <p className="mt-3 text-lg font-medium text-muted-foreground max-w-xl">
          Challenge yourself with AI-generated quizzes based on your lecture notes.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left — Lecture picker */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Select Lectures</h2>
                  <p className="text-sm text-muted-foreground">{selectedNoteIds.length} selected</p>
                </div>
              </div>
              {selectedNoteIds.length > 0 && (
                <button onClick={() => setSelectedNoteIds([])} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {fetchingLectures ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : lectures.length > 0 ? (
                lectures.map((lecture) => {
                  const selected = selectedNoteIds.includes(lecture.id);
                  return (
                    <div
                      key={lecture.id}
                      onClick={() => handleToggleLecture(lecture.id)}
                      className={cn(
                        "flex items-center gap-4 cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200",
                        selected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all", selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30")}>
                        {selected && <Check size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate text-foreground">{lecture.title || `Lecture ${lecture.id}`}</p>
                        {lecture.subject && <p className="text-xs text-muted-foreground">{lecture.subject}</p>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No lectures available</p>
                  <p className="text-sm mt-1">Upload some lectures first to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Config + Start */}
        <div className="flex flex-col gap-6">
          {/* Questions count */}
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                <Brain size={20} />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Questions</h2>
                <p className="text-sm text-muted-foreground">How many to answer</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[5, 10, 15, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={cn(
                    "flex-1 min-w-[56px] rounded-xl py-3 text-sm font-black transition-all border-2",
                    numQuestions === n ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border hover:border-primary/50 text-foreground"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-bold text-muted-foreground">Or enter custom number</label>
              <input
                type="number"
                min={1} max={50}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="h-12 w-full rounded-xl border bg-background px-4 text-sm font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Timer */}
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Time per question</h2>
                <p className="text-sm text-muted-foreground">
                  {timerDuration === 0 ? "Unlimited time" : `${timerDuration}s per question`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimerDuration(opt.value)}
                  className={cn(
                    "flex-1 min-w-[48px] rounded-xl py-2.5 text-sm font-black transition-all border-2",
                    timerDuration === opt.value ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border hover:border-amber-500/50 text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={startQuiz}
            disabled={loading || selectedNoteIds.length === 0 || !numQuestions}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-base font-black text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-[1.02] hover:shadow-primary/50 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Start Quiz Session</>}
          </button>
          {selectedNoteIds.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Select at least one lecture to begin</p>
          )}
        </div>
      </div>
    </div>
  );
}
