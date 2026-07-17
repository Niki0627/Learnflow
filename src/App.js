"use client";

// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SidebarLayout from "./layout/SidebarLayout";

// Page stubs - create these components or replace with your existing pages
import Dashboard from "./views/Dashboard";
// import UploadPage from "./views/UploadNote"; // Removed
import QuestionsPage from "./views/GenerateQuestions";
import QuizPage from "./views/Quiz";
import WeakTopicsPage from "./views/WeakTopics";
import StudyPlanPage from "./views/StudyPlan";
import QuizWrapper from "./views/QuizWrapper";
import QuizEntry from "./views/QuizEntry";
import WeakTopicsEntry from "./views/WeakTopicsEntry";
import Login from "./views/Login";
import Register from "./views/Register";
import Profile from "./views/Profile";
import GoogleLogin from "./views/GoogleLogin";
import QuizResult from "./views/QuizResult";
import Lectures from "./views/Lectures";
import Flashcards from "./views/Flashcards";
import SummarizeLectures from "./views/SummarizeLectures";
import ExamPreparation from "./views/ExamPreparation";
import LandingPage from "./views/LandingPage";
import ConceptCoach from "./views/ConceptCoach";
import QuestionBank from "./views/QuestionBank";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider } from "./context/ThemeContext";
// import theme from "./theme"; // Handled by context now

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/google-login" element={<GoogleLogin />} />

            {/* Protected routes with sidebar */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="questions" element={<QuestionsPage />} />
              <Route path="quiz" element={<QuizEntry />} />
              {/* Quiz wrapper for detailed view if needed */}
              <Route path="quiz/:noteId" element={<QuizWrapper />} />

              <Route path="weak-topics/:noteId" element={<WeakTopicsPage />} />

              {/* Analysis points to StudyPlan now */}
              <Route path="analysis" element={<StudyPlanPage />} />
              <Route path="study-plan" element={<StudyPlanPage />} />

              <Route path="weak-topics" element={<WeakTopicsEntry />} />
              <Route path="profile" element={<Profile />} />
              <Route path="quiz-result" element={<QuizResult />} />
              <Route path="lectures" element={<Lectures />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="summarize" element={<SummarizeLectures />} />
              <Route path="exam-preparation" element={<ExamPreparation />} />
              <Route path="concept-coach" element={<ConceptCoach />} />
              <Route path="question-bank" element={<QuestionBank />} />
            </Route>

            {/* Active Quiz Environment (Fullscreen) */}
            <Route
              path="/quiz-mode"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
