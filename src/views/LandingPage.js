import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  GraduationCap,
  Languages,
  Library,
  LockKeyhole,
  Menu,
  MonitorPlay,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import heroIllustration from "../assets/hero_illustration_themed_1765945437565.png";

const heroIllustrationUrl =
  typeof heroIllustration === "string" ? heroIllustration : heroIllustration.src;

const navItems = ["Home", "Courses", "Lectures", "Quiz", "Flashcards", "Coach"];

const heroStats = [
  { label: "Study flows", value: "8+" },
  { label: "AI providers", value: "3" },
  { label: "Secure stack", value: "Next + Supabase" },
];

const featureCards = [
  {
    icon: MonitorPlay,
    title: "Lecture workspace",
    text: "Upload PDFs and learning material, then keep notes, summaries, and generated practice together.",
  },
  {
    icon: GraduationCap,
    title: "Adaptive practice",
    text: "Generate focused quizzes and flashcards from lectures so revision turns into active recall.",
  },
  {
    icon: Library,
    title: "Study library",
    text: "Build a premium learning archive with weak topics, exam prep, and plans that stay organized.",
  },
];

const flow = [
  { icon: BookOpen, title: "Capture", text: "Add lectures and documents." },
  { icon: WandSparkles, title: "Generate", text: "Create summaries, MCQs, and cards." },
  { icon: Brain, title: "Master", text: "Track weak topics and revise smarter." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5ff] text-[#16112f]">
      <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[#5b4fe9] opacity-95" />
      <div className="absolute right-[-120px] top-20 h-[360px] w-[360px] rounded-full bg-[#8f8cff]/35 blur-3xl" />
      <div className="absolute bottom-[-180px] left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[#5b4fe9]/20 blur-3xl" />

      <section className="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_34px_100px_rgba(50,36,184,0.18)] backdrop-blur-2xl">
          <header className="relative z-20 flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-9">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#5b4fe9] text-white shadow-[0_16px_34px_rgba(91,79,233,0.32)]">
                <GraduationCap size={25} strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-2xl font-black tracking-normal">
                  <span className="text-[#5b4fe9]">Learn</span>Flow
                </div>
                <div className="text-xs font-bold text-[#625c85]">
                  Online education workspace
                </div>
              </div>
            </div>

            <nav className="hidden items-center gap-1 rounded-full border border-[#ddd8fa]/80 bg-white/72 p-1.5 shadow-[0_12px_34px_rgba(50,36,184,0.08)] backdrop-blur-xl lg:flex">
              {navItems.map((item, index) => (
                <button
                  key={item}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    index === 0
                      ? "bg-[#eeeafe] text-[#3124b8]"
                      : "text-[#625c85] hover:bg-[#f3f0ff] hover:text-[#3124b8]"
                  }`}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                className="hidden h-10 items-center gap-2 rounded-full border border-[#ddd8fa] bg-white/70 px-3 text-xs font-bold text-[#16112f] backdrop-blur-xl md:flex"
                type="button"
              >
                <Languages size={16} />
                English
              </button>
              <button
                className="hidden h-10 w-10 place-items-center rounded-full border border-[#ddd8fa] bg-white/70 text-[#16112f] backdrop-blur-xl md:grid"
                type="button"
                aria-label="Notifications"
              >
                <Bell size={17} />
              </button>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                <UserRound size={17} />
                Login
              </Button>
              <Button className="hidden sm:inline-flex" onClick={() => navigate("/register")}>
                Start now
                <ArrowRight size={17} />
              </Button>
              <button
                className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd8fa] bg-white/70 text-[#16112f] backdrop-blur-xl lg:hidden"
                type="button"
                aria-label="Open menu"
              >
                <Menu size={19} />
              </button>
            </div>
          </header>

          <div className="relative z-10 grid min-h-[620px] items-center gap-8 px-5 pb-28 pt-10 md:grid-cols-[1.05fr_0.95fr] lg:px-9 lg:pb-36 lg:pt-14">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ddd8fa] bg-white/78 px-4 py-2 text-sm font-extrabold text-[#3124b8] shadow-[0_14px_34px_rgba(50,36,184,0.08)] backdrop-blur-xl">
                <Sparkles size={16} />
                AI-powered online education
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-[#16112f] sm:text-6xl lg:text-7xl">
                Online
                <span className="block text-[#5b4fe9]">Education</span>
                Rebuilt Premium.
              </h1>

              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#625c85]">
                A calm, high-end study workspace where lecture uploads, summaries,
                quizzes, flashcards, weak topics, and exam planning all feel like one
                elegant learning system.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("/register")}>
                  Start now
                  <ArrowRight size={19} />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Open dashboard
                </Button>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#ddd8fa]/80 bg-white/72 px-4 py-3 shadow-[0_14px_36px_rgba(50,36,184,0.08)] backdrop-blur-xl"
                  >
                    <div className="text-2xl font-black text-[#3124b8]">{stat.value}</div>
                    <div className="text-xs font-bold text-[#625c85]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute h-[420px] w-[420px] rounded-full bg-[#8f8cff]/38 blur-2xl" />
              <div className="absolute right-2 top-10 h-24 w-24 rounded-full bg-[#5b4fe9]/20" />
              <div className="absolute bottom-12 left-6 h-16 w-16 rounded-full bg-[#70d6ff]/34" />
              <img
                src={heroIllustrationUrl}
                alt="Student studying online with learning icons"
                className="relative z-10 w-full max-w-[520px] drop-shadow-[0_32px_50px_rgba(50,36,184,0.18)]"
              />
              <Card className="absolute bottom-2 right-1 z-20 hidden w-56 md:block">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LockKeyhole size={17} />
                    Secure by design
                  </CardTitle>
                  <CardDescription>
                    Supabase auth, private routes, and clean protected flows.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-0 h-56 bg-[#5b4fe9]">
            <div className="absolute -top-20 left-[-6%] h-40 w-[112%] rounded-[50%] bg-white" />
          </div>

          <div className="relative z-10 grid gap-5 bg-[#5b4fe9] px-5 pb-8 pt-6 md:grid-cols-3 lg:px-9">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-white/24 bg-white/10 text-white shadow-none"
                >
                  <CardHeader>
                    <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/30 bg-white/12">
                      <Icon size={34} strokeWidth={1.8} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-white/78">
                      {feature.text}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <section className="grid gap-5 py-8 md:grid-cols-3">
          {flow.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="bg-white/72">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eeeafe] text-[#3124b8]">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">{item.title}</h2>
                    <p className="text-sm font-medium leading-6 text-[#625c85]">
                      {item.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </section>
    </main>
  );
}
