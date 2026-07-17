import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  BrainCircuit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RefreshCw,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import API from '../api/api';
import { cn } from '../lib/utils';

export default function Flashcards() {
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [ratings, setRatings] = useState({}); // { cardIndex: 'again' | 'hard' | 'good' | 'easy' }
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get('lectures/').then(r => {
      if (!cancelled) setLectures(r.data || []);
    }).catch(() => {
      if (!cancelled) setError('Failed to load lectures. Please refresh.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedLecture) {
      setFlashcards([]);
      return;
    }
    setLoading(true);
    API.get(`flashcards/?note_id=${selectedLecture}`)
       .then(res => {
           setFlashcards(res.data || []);
           setCurrentIndex(0);
           setIsFlipped(false);
           setSessionComplete(false);
           setRatings({});
       })
       .catch(err => setError("Failed to load cards."))
       .finally(() => setLoading(false));
  }, [selectedLecture]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (flashcards.length === 0 || sessionComplete) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(f => !f);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flashcards.length, sessionComplete, currentIndex]);

  const handleGenerate = async () => {
    if (!selectedLecture) return;
    setGenerating(true);
    setError('');
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setBookmarked(new Set());
    setRatings({});
    setSessionComplete(false);

    try {
      await API.post('flashcards/generate/', { note_id: selectedLecture, count: 15 });
      const res = await API.get(`flashcards/?note_id=${selectedLecture}`);
      setFlashcards(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate flashcards. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex >= flashcards.length - 1) {
      setSessionComplete(true);
      return;
    }
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(i => i + 1), 150);
  }, [currentIndex, flashcards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(i => i - 1), 150);
  }, [currentIndex]);

  const handleRate = async (rating) => {
    const card = flashcards[currentIndex];
    setRatings(r => ({ ...r, [currentIndex]: rating }));
    try {
        if(card.id) await API.post(`flashcards/${card.id}/review/`, { rating });
    } catch {
      // Keep local progress even if sync fails
    }
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatings({});
    setSessionComplete(false);
  };

  const toggleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const masteredCount = Object.values(ratings).filter(r => r === 'good' || r === 'easy').length;
  const progress = flashcards.length > 0 ? (currentIndex / flashcards.length) * 100 : 0;
  const currentCard = flashcards[currentIndex];

  if (loading && !selectedLecture) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto min-h-[calc(100vh-100px)]">
      
      {/* ── HEADER ── */}
      <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BrainCircuit size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Flashcard Studio</h1>
              <p className="text-sm font-medium text-muted-foreground">AI-powered spaced repetition learning</p>
            </div>
          </div>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <select 
            value={selectedLecture}
            onChange={(e) => setSelectedLecture(e.target.value)}
            className="flex-1 md:w-64 rounded-xl border border-primary/20 bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Select a lecture note...</option>
            {lectures.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={!selectedLecture || generating}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {generating ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" /> Generating...</>
            ) : (
              <><Sparkles size={16} /> Generate</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 flex-col md:flex-row gap-6">
        
        {/* SIDEBAR: Stats & Index */}
        <div className="w-full md:w-72 flex flex-col gap-4">
          <div className="rounded-[1.5rem] border border-primary/20 bg-card p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Session Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary/20 bg-background p-3 text-center">
                <div className="text-xl font-black text-primary">{currentIndex + 1} / {flashcards.length || 0}</div>
                <div className="text-xs font-bold text-muted-foreground mt-1">Progress</div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-background p-3 text-center">
                <div className="text-xl font-black text-emerald-500">{masteredCount}</div>
                <div className="text-xs font-bold text-muted-foreground mt-1">Mastered</div>
              </div>
            </div>
            
            {flashcards.length > 0 && (
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {flashcards.length > 0 && (
            <div className="flex-1 rounded-[1.5rem] border border-primary/20 bg-card p-4 shadow-sm flex flex-col max-h-[500px]">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 px-1">Card Index</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
                {flashcards.map((card, idx) => {
                  const isActive = idx === currentIndex;
                  const rating = ratings[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => { setCurrentIndex(idx); setIsFlipped(false); }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition",
                        isActive ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                      )}
                    >
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                        isActive && !rating ? "bg-primary text-white" : 
                        rating === 'easy' || rating === 'good' ? "bg-emerald-500/20 text-emerald-600" :
                        rating === 'hard' ? "bg-amber-500/20 text-amber-600" :
                        rating === 'again' ? "bg-red-500/20 text-red-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {rating === 'easy' || rating === 'good' ? <CheckCircle2 size={14} /> :
                         rating === 'hard' ? '!' :
                         rating === 'again' ? <XCircle size={14} /> :
                         idx + 1}
                      </div>
                      <span className={cn(
                        "truncate text-sm font-semibold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {card.front}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MAIN STUDIO */}
        <div className="flex-1 rounded-[2rem] border border-primary/20 bg-card p-6 md:p-10 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
          {flashcards.length === 0 ? (
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-primary/20 bg-primary/5 text-primary">
                {generating ? <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /> : <Sparkles size={48} />}
              </div>
              <h2 className="text-2xl font-black mb-3">Ready to Study?</h2>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                Select a lecture and click "Generate" to create a personalized deck of AI flashcards.
              </p>
            </div>
          ) : sessionComplete ? (
            <div className="text-center max-w-sm animate-in zoom-in-95 duration-500">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/20">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-black mb-3">Session Complete!</h2>
              <p className="text-muted-foreground font-medium mb-8">
                You mastered {masteredCount} out of {flashcards.length} cards.
              </p>
              <button
                onClick={handleRestart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                <RefreshCw size={18} /> Study Again
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl flex flex-col h-full">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Card {currentIndex + 1} of {flashcards.length}
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1 && ratings[currentIndex]}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Flashcard */}
              <div className="perspective-1000 flex-1 relative min-h-[300px]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentIndex + (isFlipped ? '-back' : '-front')}
                    initial={{ rotateX: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                  >
                    <div className={cn(
                      "flex h-full w-full flex-col items-center justify-center rounded-[2rem] border-2 p-10 text-center shadow-lg transition-colors",
                      isFlipped ? "border-primary/50 bg-primary/5" : "border-primary/20 bg-background hover:border-primary/30"
                    )}>
                      <button
                        onClick={toggleBookmark}
                        className="absolute right-6 top-6 text-muted-foreground hover:text-amber-500 transition"
                      >
                        <Bookmark size={24} className={bookmarked.has(currentIndex) ? "fill-amber-500 text-amber-500" : ""} />
                      </button>

                      <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">
                        {isFlipped ? "Answer" : "Question"}
                      </div>
                      
                      <div className="text-xl md:text-3xl font-bold leading-relaxed text-foreground">
                        {isFlipped ? currentCard?.back : currentCard?.front}
                      </div>

                      <div className="absolute bottom-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground opacity-50">
                        <PlayCircle size={14} /> Click space to flip
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Spaced Repetition Ratings */}
              <div className={cn(
                "mt-8 grid grid-cols-4 gap-3 transition-all duration-300",
                isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              )}>
                <button onClick={() => handleRate('again')} className="rounded-xl border border-red-200 bg-red-50 py-3 text-center font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20">
                  <span className="block text-xs uppercase tracking-widest opacity-70 mb-0.5">Again</span>
                  &lt;1m
                </button>
                <button onClick={() => handleRate('hard')} className="rounded-xl border border-amber-200 bg-amber-50 py-3 text-center font-bold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20">
                  <span className="block text-xs uppercase tracking-widest opacity-70 mb-0.5">Hard</span>
                  1d
                </button>
                <button onClick={() => handleRate('good')} className="rounded-xl border border-blue-200 bg-blue-50 py-3 text-center font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <span className="block text-xs uppercase tracking-widest opacity-70 mb-0.5">Good</span>
                  3d
                </button>
                <button onClick={() => handleRate('easy')} className="rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-center font-bold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <span className="block text-xs uppercase tracking-widest opacity-70 mb-0.5">Easy</span>
                  5d
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
