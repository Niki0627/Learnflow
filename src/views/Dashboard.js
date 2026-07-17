import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  PlayCircle,
  Upload,
  Warning,
  Flame,
  BrainCircuit,
  FileText,
  AlertTriangle,
  LibraryBig,
  Loader2,
  Trash2,
  Plus
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import { cn } from "../lib/utils";

// If shadcn components exist, use them. If not, standard html/tailwind is used to ensure no missing deps.
// We will use standard tailwind classes for the best look as per the instructions.

const SUBJECT_COLORS = [
  "#2563EB", "#7C3AED", "#DB2777", "#EA580C", "#16A34A", "#0891B2",
];

const StatCard = ({ title, value, subtext, icon: Icon, themeColor = "indigo" }) => {
  const colors = {
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-600", iconBg: "bg-orange-500/20", subBg: "bg-orange-500/20" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-600", iconBg: "bg-indigo-500/20", subBg: "bg-indigo-500/20" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-600", iconBg: "bg-emerald-500/20", subBg: "bg-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-600", iconBg: "bg-amber-500/20", subBg: "bg-amber-500/20" },
  };
  const theme = colors[themeColor] || colors.indigo;

  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] p-6 shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-md", theme.bg, theme.border)}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", theme.iconBg)}>
            <Icon size={28} className={theme.text} />
          </div>
          {subtext && (
            <span className={cn("rounded-lg px-2.5 py-1 text-xs font-bold", theme.subBg, theme.text)}>
              {subtext}
            </span>
          )}
        </div>
        <div>
          <h3 className={cn("text-4xl font-black tracking-tight", theme.text)}>{value}</h3>
          <p className={cn("mt-1 text-sm font-semibold opacity-80", theme.text)}>{title}</p>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, subtitle, icon: Icon, onClick, colorClass }) => {
  const borderTint = colorClass ? colorClass.split(" ")[0].replace("bg-", "border-").replace("500", "500/20") : "border-border/50";
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        borderTint
      )}
    >
      <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6", colorClass)}>
        <Icon size={26} />
      </div>
      <div>
        <h4 className="mb-2 text-lg font-bold text-foreground">{title}</h4>
        <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
      </div>
      <div className="absolute bottom-6 right-6 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", colorClass.split(" ")[0])}>
          →
        </div>
      </div>
    </div>
  );
};

const MasteryBar = ({ subject, percentage, color }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold text-foreground">{subject}</span>
      <span className="text-xs font-black" style={{ color }}>{percentage}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const DashboardTopicChip = ({ topic, subject, accuracy, noteId, onPlay }) => {
  const isCritical = accuracy < 40;
  const isWarning = accuracy >= 40 && accuracy < 70;
  
  const colorClass = isCritical 
    ? "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20" 
    : isWarning 
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20";

  return (
    <button
      onClick={() => onPlay(topic, subject, noteId)}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5",
        colorClass
      )}
      title="Click to practice & explain"
    >
      <span>{topic}</span>
      <span className="opacity-70">{accuracy}%</span>
    </button>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  
  const [todoOpen, setTodoOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  
  const [weakTopicDialog, setWeakTopicDialog] = useState({
    open: false, topic: null, subject: null, noteId: null, data: null, loading: false,
  });
  
  const [practiceAllDialog, setPracticeAllDialog] = useState({
    open: false, questionCount: 10, selectedTopics: [],
  });

  useEffect(() => {
    fetchStats();
    loadTodos();
    const handleVisibilityChange = () => { if (!document.hidden) fetchStats(); };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const interval = setInterval(() => { if (!document.hidden) fetchStats(); }, 30000);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setStatsError("");
    try {
      const response = await API.get("dashboard/stats/");
      setStats(response.data);
    } catch (error) {
      setStatsError("Could not load your dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const loadTodos = () => {
    const saved = localStorage.getItem("dashboard_todos");
    if (saved) setTodos(JSON.parse(saved));
  };
  const saveTodos = (newTodos) => {
    localStorage.setItem("dashboard_todos", JSON.stringify(newTodos));
    setTodos(newTodos);
  };
  const addTodo = () => {
    if (newTodo.trim()) {
      saveTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };
  const toggleTodo = (id) => saveTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTodo = (id) => saveTodos(todos.filter(t => t.id !== id));

  const handleWeakTopicExplain = async (topic, subject, noteId) => {
    setWeakTopicDialog({ open: true, topic, subject, noteId, data: null, loading: true });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const response = await API.post("weak-topic/explain/", { topic, subject }, { signal: controller.signal });
      clearTimeout(timeoutId);
      setWeakTopicDialog(prev => ({ ...prev, data: response.data.data, loading: false }));
    } catch (error) {
      let errorMessage = "Failed to load explanation. ";
      if (error.name === "AbortError" || error.code === "ECONNABORTED") errorMessage = "Request timed out. The AI is taking too long to respond. ";
      else if (error.response?.status === 401) errorMessage = "Please log in to access this feature. ";
      else if (error.response?.status === 500) errorMessage = "Server error. Please try again. ";
      setWeakTopicDialog(prev => ({ ...prev, loading: false, data: { error: errorMessage, canRetry: true } }));
    }
  };

  const handleStartPractice = (topic) => {
    const nid = weakTopicDialog.noteId;
    setWeakTopicDialog({ open: false, topic: null, subject: null, noteId: null, data: null, loading: false });
    if (nid) navigate(`/quiz-mode?noteId=${nid}&n=10`);
    else navigate("/quiz", { state: { topic } });
  };

  const handlePracticeAll = () => {
    if (!data?.weak_topics?.length) return;
    setPracticeAllDialog({ open: true, questionCount: 10, selectedTopics: data.weak_topics.map(w => w.topic) });
  };

  const handleStartPracticeAll = () => {
    const selectedNoteIds = data.weak_topics
      .filter(w => practiceAllDialog.selectedTopics.includes(w.topic) && w.note_id)
      .map(w => w.note_id);
    const uniqueNoteIds = [...new Set(selectedNoteIds)];
    setPracticeAllDialog({ open: false, questionCount: 10, selectedTopics: [] });

    if (uniqueNoteIds.length > 0) {
      navigate(`/quiz-mode?noteIds=${uniqueNoteIds.join(",")}&n=${practiceAllDialog.questionCount || 10}`, {
        state: { weakTopics: practiceAllDialog.selectedTopics, isPracticeAll: true },
      });
    } else {
      navigate("/quiz", {
        state: { weakTopics: practiceAllDialog.selectedTopics, questionCount: practiceAllDialog.questionCount, isPracticeAll: true },
      });
    }
  };

  const handleToggleTopic = (topic) => {
    setPracticeAllDialog(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter(t => t !== topic)
        : [...prev.selectedTopics, topic],
    }));
  };

  const data = stats || {
    streak: 0, questions_answered: 0, topics_mastered: 0, avg_score: 0,
    weekly_activity: [], recent_activity: [], quiz_scores: [], score_distribution: [], skill_radar: [], mastery_data: [], weak_topics: []
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-bold text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-2">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{user?.first_name || "Student"}</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Ready to crush your goals today? You have a <span className="font-bold text-orange-500">{data.streak}-day streak!</span>
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={() => setTodoOpen(true)}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
          >
            <CalendarDays size={18} />
            <span>Daily Goals</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-2">
        <StatCard
          title="Current Streak"
          value={`${data.streak || 0} Days`}
          subtext="Keep it up!"
          icon={Flame}
          themeColor="orange"
        />
        <StatCard
          title="Questions Answered"
          value={data.questions_answered}
          subtext="Total"
          icon={FileQuestion}
          themeColor="indigo"
        />
        <StatCard
          title="Topics Mastered"
          value={data.topics_mastered}
          subtext=">80% mastery"
          icon={GraduationCap}
          themeColor="emerald"
        />
        <StatCard
          title="Avg. Quiz Score"
          value={`${data.avg_score}%`}
          subtext="Lifetime"
          icon={BrainCircuit}
          themeColor="amber"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1.5 rounded-full bg-primary" />
          <h2 className="text-2xl font-black tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Start Adaptive Quiz"
            subtitle="Test your knowledge on weak areas."
            icon={BrainCircuit}
            colorClass="bg-indigo-500 text-white"
            onClick={() => navigate("/quiz")}
          />
          <QuickActionCard
            title="Upload Notes"
            subtitle="Generate summaries and flashcards."
            icon={Upload}
            colorClass="bg-emerald-500 text-white"
            onClick={() => navigate("/lectures")}
          />
          <QuickActionCard
            title="Study Plan"
            subtitle="Create a personalized study guide."
            icon={FileText}
            colorClass="bg-amber-500 text-white"
            onClick={() => navigate("/analysis")}
          />
          <QuickActionCard
            title="Exam Prep"
            subtitle="Generate strategies & practice."
            icon={GraduationCap}
            colorClass="bg-pink-500 text-white"
            onClick={() => navigate("/exam-preparation")}
          />
        </div>
      </div>

      {/* Analytics & Insights */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1.5 rounded-full bg-purple-500" />
          <h2 className="text-2xl font-black tracking-tight">Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Weekly Activity */}
          <div className="rounded-[2rem] border border-indigo-500/20 bg-card p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500"><LayoutDashboard size={20} /></div>
              Weekly Activity
            </h3>
            <div className="flex h-[260px] w-full min-h-[260px] flex-col items-center justify-center">
              {data.weekly_activity?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weekly_activity}>
                    <defs>
                      <linearGradient id="colorQ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="questions" stroke="#6366F1" strokeWidth={3} fill="url(#colorQ)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center opacity-60">
                  <LayoutDashboard size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">Not enough data to display.</p>
                  <p className="text-xs text-muted-foreground">Start practicing to see your activity!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Scores */}
          <div className="rounded-[2rem] border border-emerald-500/20 bg-card p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500"><CheckCircle size={20} /></div>
              Recent Scores
            </h3>
            <div className="flex h-[260px] w-full min-h-[260px] flex-col items-center justify-center">
              {data.quiz_scores?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.quiz_scores}>
                     <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" />
                        <stop offset="95%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="score" fill="url(#colorScore)" radius={[6, 6, 6, 6]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center opacity-60">
                  <CheckCircle size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">No quiz scores yet.</p>
                  <p className="text-xs text-muted-foreground">Complete a quiz to see your progress!</p>
                </div>
              )}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="flex flex-col rounded-[2rem] border border-red-500/20 bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-500"><AlertTriangle size={20} /></div>
                Weak Topics
              </h3>
              <button onClick={handlePracticeAll} className="text-xs font-bold text-primary hover:underline">
                Practice All
              </button>
            </div>
            <div className="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto pr-2 custom-scrollbar">
              {data.weak_topics?.length > 0 ? (
                data.weak_topics.map((w, idx) => (
                  <DashboardTopicChip key={idx} topic={w.topic} subject={w.subject} accuracy={w.accuracy} noteId={w.note_id} onPlay={handleWeakTopicExplain} />
                ))
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-center opacity-60">
                  <CheckCircle size={32} className="mb-2 text-emerald-500" />
                  <p className="text-sm font-semibold">Great job! No weak topics detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topic Explanation Modal */}
      {weakTopicDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border shadow-2xl p-6 sm:p-8 custom-scrollbar relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setWeakTopicDialog(prev => ({...prev, open: false}))} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              ✕
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <PlayCircle className="text-primary" />
                Learn: {weakTopicDialog.topic}
              </h2>
              {weakTopicDialog.subject && <p className="text-sm font-semibold text-muted-foreground mt-1 ml-9">{weakTopicDialog.subject}</p>}
            </div>

            {weakTopicDialog.loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p className="font-bold">Generating personalized AI explanation...</p>
              </div>
            ) : weakTopicDialog.data?.error ? (
              <div className="text-center py-8">
                <p className="text-red-500 font-bold mb-4">{weakTopicDialog.data.error}</p>
                {weakTopicDialog.data.canRetry && (
                  <button onClick={() => handleWeakTopicExplain(weakTopicDialog.topic, weakTopicDialog.subject, weakTopicDialog.noteId)} className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold">
                    Try Again
                  </button>
                )}
              </div>
            ) : weakTopicDialog.data ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-2">Understanding the Topic</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{weakTopicDialog.data.explanation}</p>
                </div>
                {weakTopicDialog.data.key_concepts?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">Key Concepts</h3>
                    <ul className="space-y-2">
                      {weakTopicDialog.data.key_concepts.map((c, i) => (
                        <li key={i} className="flex gap-3 text-muted-foreground"><CheckCircle className="text-emerald-500 shrink-0" size={18} /><span>{c}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {weakTopicDialog.data.common_mistakes?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">Common Mistakes</h3>
                    <ul className="space-y-2">
                      {weakTopicDialog.data.common_mistakes.map((c, i) => (
                        <li key={i} className="flex gap-3 text-muted-foreground"><AlertTriangle className="text-red-500 shrink-0" size={18} /><span>{c}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={() => setWeakTopicDialog(prev => ({...prev, open: false}))} className="px-6 py-2 rounded-full font-bold hover:bg-muted transition-colors">Close</button>
                  <button onClick={() => handleStartPractice(weakTopicDialog.topic)} className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <BrainCircuit size={18} /> Start Practice
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Todo Modal */}
      {todoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setTodoOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              ✕
            </button>
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><CalendarDays className="text-primary"/> Daily Goals</h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Add a new task..." 
                className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
              />
              <button onClick={addTodo} className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-colors"><Plus size={20}/></button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {todos.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8 font-medium">No tasks yet. Add your first goal!</p>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleTodo(todo.id)} className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-colors", todo.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                        {todo.completed && <Check size={14} />}
                      </button>
                      <span className={cn("text-sm font-medium transition-colors", todo.completed && "line-through text-muted-foreground")}>{todo.text}</span>
                    </div>
                    <button onClick={() => deleteTodo(todo.id)} className="text-muted-foreground hover:text-red-500 p-1 rounded-md hover:bg-red-500/10 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Practice All Modal */}
      {practiceAllDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card border shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><BrainCircuit className="text-primary"/> Practice Weak Topics</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Select Topics</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {data.weak_topics?.map(topic => (
                    <div key={topic.topic} onClick={() => handleToggleTopic(topic.topic)} className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all", practiceAllDialog.selectedTopics.includes(topic.topic) ? "border-primary bg-primary/5" : "hover:border-primary/50")}>
                      <button className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0", practiceAllDialog.selectedTopics.includes(topic.topic) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                        {practiceAllDialog.selectedTopics.includes(topic.topic) && <Check size={14} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{topic.topic}</p>
                        <p className="text-xs text-muted-foreground">{topic.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Number of Questions</h3>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n} onClick={() => setPracticeAllDialog(prev => ({...prev, questionCount: n}))} className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-all border", practiceAllDialog.questionCount === n ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50 text-foreground")}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={() => setPracticeAllDialog(prev => ({...prev, open: false}))} className="px-6 py-2 rounded-full font-bold hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleStartPracticeAll} disabled={practiceAllDialog.selectedTopics.length === 0} className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  <PlayCircle size={18} /> Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
