import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileQuestion,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  X,
  ScrollText,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { cn, formatUsername } from "../lib/utils";

const SIDEBAR_WIDTH = "w-64";

const getInitials = (user) => {
  if (!user) return "U";
  if (user.first_name && user.last_name)
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  
  const name = formatUsername(user.username || user.email);
  return name.charAt(0).toUpperCase() || "U";
};

const useNavItems = (t) =>
  React.useMemo(
    () => [
      { key: "dashboard", label: t("nav_dashboard", "Dashboard"), icon: <LayoutDashboard size={18} />, to: "/dashboard" },
      { key: "lectures", label: t("nav_lectures", "Lectures"), icon: <BookOpen size={18} />, to: "/lectures" },
      { key: "summarize", label: t("nav_summarize", "Summarize"), icon: <ScrollText size={18} />, to: "/summarize" },
      { key: "questions", label: t("nav_quiz", "Quiz"), icon: <FileQuestion size={18} />, to: "/quiz" },
      { key: "weak-topics", label: t("nav_weak_topics", "Weak Topics"), icon: <GraduationCap size={18} />, to: "/weak-topics" },
      { key: "question-bank", label: "Question Bank", icon: <Library size={18} />, to: "/question-bank" },
      { key: "flashcards", label: t("nav_flashcards", "Flashcards"), icon: <Layers size={18} />, to: "/flashcards" },
      { key: "study-plan", label: t("nav_study_plan", "Study Plan"), icon: <CalendarDays size={18} />, to: "/study-plan" },
      { key: "exam-preparation", label: t("nav_exam_prep", "Exam Prep"), icon: <GraduationCap size={18} />, to: "/exam-preparation" },
      { key: "concept-coach", label: t("nav_concept_coach", "Concept Coach"), icon: <Bot size={18} />, to: "/concept-coach", flagship: true },
      { key: "profile", label: t("nav_profile", "Profile"), icon: <UserRound size={18} />, to: "/profile" },
    ],
    [t],
  );

const NavItem = ({ item, isActive, onClick }) => {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mx-2",
        isActive
          ? "bg-primary/10 text-primary font-bold shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center transition-all shadow-sm",
          isActive
            ? "bg-primary text-primary-foreground"
            : item.flagship
            ? "bg-primary/20 text-primary"
            : "bg-background border border-border group-hover:bg-background group-hover:border-primary/50"
        )}
      >
        {item.icon}
      </div>
      <span className="flex-1 text-sm">{item.label}</span>
      {item.badge && !isActive && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm">
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight size={16} className="text-primary" />}
    </Link>
  );
};

function SidebarContent({ navItems, location, handleLogout, user, t, onNavClick }) {
  const initials = getInitials(user);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border py-6 px-3">
      <Link to="/dashboard" className="flex items-center gap-3 px-3 mb-6 outline-none">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
          <GraduationCap className="text-white" size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-black text-lg bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
            LearnFlow
          </h1>
        </div>
      </Link>

      <div className="h-px bg-border my-2 mx-3 opacity-50" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-1 no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <React.Fragment key={item.key}>
              {/* Separator removed as per user request */}
              <NavItem item={item} isActive={isActive} onClick={onNavClick} />
            </React.Fragment>
          );
        })}
      </div>

      <div className="h-px bg-border my-4 mx-3 opacity-50" />

      <div className="mx-2 p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-3 group hover:bg-muted transition-colors">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : formatUsername(user?.username || user?.email)}
          </p>
          <p className="text-xs text-muted-foreground truncate">Student</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors outline-none focus:ring-2 focus:ring-ring"
          title={t("nav_logout", "Logout")}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default function SidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = useNavItems(t);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 ${SIDEBAR_WIDTH} fixed inset-y-0 z-20`}>
        <SidebarContent
          navItems={navItems}
          location={location}
          handleLogout={handleLogout}
          user={user}
          t={t}
        />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className={`relative flex flex-col flex-shrink-0 ${SIDEBAR_WIDTH} max-w-[80%] bg-card border-r shadow-2xl transition-transform`}>
            <SidebarContent
              navItems={navItems}
              location={location}
              handleLogout={handleLogout}
              user={user}
              t={t}
              onNavClick={handleNavClick}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-3rem] p-2 bg-background border rounded-md shadow-md text-foreground"
            >
              <X size={20} />
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 relative">
        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-black text-xs">LF</span>
            </div>
            <span className="font-black text-primary">LearnFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* The Page Route Content */}
        <div className="flex-1 overflow-x-hidden p-6 md:p-10">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
