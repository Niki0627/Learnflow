"use client";

import React, { useState, useEffect } from "react";
import {
  Award, BrainCircuit, Camera, CheckCircle2, Edit, Flame, GraduationCap,
  Link as LinkIcon, Medal, Settings, Share, UserCircle,
} from "lucide-react";
import { useAuth } from "@/src/core/auth/context";
import { cn } from "@/src/core/utils/cn";
import { formatUsername } from "@/src/core/utils/formatUsername";
import { fetchProfile, saveProfile } from "../api";
import type { ProfileForm, ProfileStats, ProfilePreferences } from "../types";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileForm>({
    bio: "",
    school: "Westside High School",
    grade: "11th Grade",
    subjects: ["Mathematics", "Physics"],
    preferences: {
      adaptiveDifficulty: true,
      strictMode: false,
      studyReminders: true,
      achievementUnlocks: true,
      weeklyReport: false,
    },
  });

  const [stats, setStats] = useState<ProfileStats>({ total_quizzes: 0, average_score: 0, streak_days: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile().then(data => {
      setProfile({
        bio: data.bio || "",
        school: data.school || "",
        grade: data.grade || "",
        subjects: data.subjects || [],
        preferences: data.preferences || {
          adaptiveDifficulty: true, strictMode: false, studyReminders: true,
          achievementUnlocks: true, weeklyReport: false,
        },
      });
      setStats({
        total_quizzes: data.total_quizzes || 0,
        average_score: data.average_score || 0,
        streak_days: data.streak_days || 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({
        bio: profile.bio, school: profile.school, grade: profile.grade,
        subjects: profile.subjects, preferences: profile.preferences,
      });
    } catch {
      // ignore
    } finally { setSaving(false); }
  };

  const handleChange = (field: "bio" | "school" | "grade", value: string) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  const handlePreferenceChange = (key: keyof ProfilePreferences) =>
    setProfile(prev => ({ ...prev, preferences: { ...prev.preferences, [key]: !prev.preferences[key] } }));

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : formatUsername(user?.username || user?.email);
  const userInitial = displayName.charAt(0).toUpperCase() || "U";

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-pulse rounded-2xl bg-card p-6 shadow-xl border border-border/50">
        <div className="h-12 w-12 rounded-xl bg-primary/20" />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl pb-24 space-y-6">
      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">My Profile</h1>
        <p className="text-muted-foreground font-medium">Manage your personal information, achievements, and account settings.</p>
      </div>

      {/* Banner & Avatar Card */}
      <div className="rounded-[2rem] border border-primary/20 bg-card overflow-hidden shadow-sm">
        <div className="h-32 w-full bg-gradient-to-r from-violet-500/20 via-primary/20 to-blue-500/20 border-b border-border/50" />
        <div className="px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 md:-mt-16 mb-4">
            <div className="relative group">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl border-4 border-card bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary/20">
                {userInitial}
              </div>
              <button className="absolute bottom-2 right-2 h-8 w-8 rounded-xl bg-background border border-border/50 flex items-center justify-center text-foreground shadow-sm hover:bg-muted transition">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">{displayName}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 mb-2 text-sm font-semibold text-muted-foreground">
                <span>Student at {profile.school}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>{profile.grade}</span>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">PRO</span>
              </div>
              {profile.bio && <p className="text-sm font-medium text-muted-foreground/80 italic max-w-2xl">&quot;{profile.bio}&quot;</p>}
            </div>
            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground shadow-sm hover:bg-muted transition w-full md:w-auto justify-center">
                <Share size={16} /> Share
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition w-full md:w-auto justify-center">
                <Edit size={16} /> Edit Bio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] border border-blue-500/20 bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <CheckCircle2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{stats.total_quizzes}</div>
            <div className="text-sm font-bold text-muted-foreground">Quizzes Done</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-emerald-500/20 bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Award size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{stats.average_score}%</div>
            <div className="text-sm font-bold text-muted-foreground">Avg. Score</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-amber-500/20 bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Flame size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{stats.streak_days} days</div>
            <div className="text-sm font-bold text-muted-foreground">Study Streak</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="rounded-[2rem] border border-amber-500/20 bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Medal className="text-amber-500" size={24} />
                <h2 className="text-xl font-black">Achievements</h2>
              </div>
              <button className="text-sm font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Medal size={28} />, color: "text-blue-500", bg: "bg-blue-500/10", title: "Math Whiz", sub: "Top 10% in Calculus" },
                { icon: <BrainCircuit size={28} />, color: "text-purple-500", bg: "bg-purple-500/10", title: "Consistent Mind", sub: `${stats.streak_days} Day Streak` },
                { icon: <Flame size={28} />, color: "text-orange-500", bg: "bg-orange-500/10", title: "Fast Learner", sub: "Completed 5 modules" },
              ].map((b, i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-background p-4 text-center hover:border-primary/50 hover:shadow-md transition">
                  <div className={cn("mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl", b.bg, b.color)}>{b.icon}</div>
                  <div className="text-sm font-bold">{b.title}</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <UserCircle className="text-primary" size={24} />
              <h2 className="text-xl font-black">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1.5">First Name</label>
                <input type="text" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={user?.first_name || ""} />
              </div>
              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1.5">Last Name</label>
                <input type="text" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={user?.last_name || ""} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-muted-foreground block mb-1.5">Email Address</label>
                <input type="email" disabled className="w-full rounded-xl border border-border/50 bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground outline-none" defaultValue={user?.email || ""} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-muted-foreground block mb-1.5">Bio / About Me</label>
                <textarea rows={3} className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={profile.bio} onChange={e => handleChange("bio", e.target.value)} placeholder="Tell us a little about yourself..." />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <GraduationCap className="text-primary" size={24} />
              <h2 className="text-xl font-black">Academic Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1.5">School / University</label>
                <input type="text" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={profile.school} onChange={e => handleChange("school", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1.5">Grade Level</label>
                <select className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={profile.grade} onChange={e => handleChange("grade", e.target.value)}>
                  <option>9th Grade</option>
                  <option>10th Grade</option>
                  <option>11th Grade</option>
                  <option>12th Grade</option>
                  <option>Undergraduate</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Preferences */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <Settings className="text-primary" size={24} />
              <h2 className="text-xl font-black">Preferences</h2>
            </div>
            <div className="space-y-4">
              {([
                { key: "adaptiveDifficulty", label: "Adaptive Difficulty", desc: "AI adjusts question hardness." },
                { key: "strictMode", label: "Strict Exam Mode", desc: "Disable hints during practice." },
                { key: "studyReminders", label: "Study Reminders", desc: "Daily nudges to hit goals." },
                { key: "weeklyReport", label: "Weekly Report", desc: "Summary via email." },
              ] as const).map(pref => (
                <div key={pref.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="pr-4">
                    <div className="text-sm font-bold">{pref.label}</div>
                    <div className="text-xs font-semibold text-muted-foreground">{pref.desc}</div>
                  </div>
                  <button onClick={() => handlePreferenceChange(pref.key)}
                    className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      profile.preferences[pref.key] ? "bg-primary" : "bg-muted")}>
                    <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      profile.preferences[pref.key] ? "translate-x-5" : "translate-x-0")} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Connections */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <LinkIcon className="text-primary" size={24} />
              <h2 className="text-xl font-black">Connections</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.69 0 3.21.6 4.4 1.58l3.28-3.28A11.94 11.94 0 0 0 12 .9C8.17.9 4.83 2.85 2.96 5.82l2.31 3.94Z" /><path fill="#34A853" d="M16.04 18.01A7.08 7.08 0 0 1 12 19.1c-2.9 0-5.38-1.74-6.56-4.26l-3.3 2.55C4.1 21 7.78 23.1 12 23.1c2.97 0 5.7-1.04 7.78-2.74l-3.74-2.35Z" /><path fill="#FBBC05" d="M19.78 20.36C21.86 18.38 23.1 15.42 23.1 12c0-.88-.1-1.73-.27-2.55H12v4.82h6.24a5.4 5.4 0 0 1-2.22 3.55l3.76 2.54Z" /><path fill="#4285F4" d="M5.44 14.84A7.15 7.15 0 0 1 4.9 12c0-.99.17-1.94.47-2.83L3.06 5.23A11.93 11.93 0 0 0 .9 12c0 1.96.47 3.8 1.3 5.43l3.24-2.59Z" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">Google <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded uppercase">Connected</span></div>
                    <div className="text-xs font-semibold text-muted-foreground truncate w-32">{user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-foreground text-background p-1.5 rounded-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold">GitHub</div>
                    <div className="text-xs font-semibold text-muted-foreground">Not connected</div>
                  </div>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">Connect</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:pl-64 z-40 bg-background/80 backdrop-blur-md border-t border-primary/20 p-4">
        <div className="max-w-5xl mx-auto flex justify-end gap-3">
          <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition flex items-center gap-2">
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" /> : <CheckCircle2 size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
