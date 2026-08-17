"use client";

import { useState, useCallback } from "react";
import type { Lecture, LectureDetails } from "../types";
import {
  fetchLectures,
  fetchLectureDetails,
  deleteLecture,
  generateQuestions,
} from "../api";

export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLecture, setDetailsLecture] = useState<Lecture | null>(null);
  const [detailsData, setDetailsData] = useState<LectureDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadLectures = useCallback(async () => {
    const list = await fetchLectures();
    setLectures(list);
    setSelectedLecture((prev) => prev ?? (list[0] ?? null));
    setLoading(false);
  }, []);

  const handleViewDetails = async (lecture: Lecture) => {
    setDetailsLecture(lecture);
    setDetailsOpen(true);
    setLoadingDetails(true);
    setDetailsData(null);
    try {
      const res = await fetchLectureDetails(lecture.id);
      setDetailsData(res);
    } catch {
      // ignore
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleGenerateQuestions = async (noteId: number) => {
    setGenerating(true);
    try {
      await generateQuestions(noteId);
      const res = await fetchLectureDetails(noteId);
      setDetailsData(res);
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteClick = (lecture: Lecture) => {
    setLectureToDelete(lecture);
    setDeleteError("");
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!lectureToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteLecture(lectureToDelete.id);
      setLectures((prev) => prev.filter((l) => l.id !== lectureToDelete.id));
      if (selectedLecture?.id === lectureToDelete.id) setSelectedLecture(null);
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setDeleteError(e?.error ?? "Failed to delete lecture.");
    } finally {
      setDeleting(false);
    }
  };

  return {
    lectures, loading, selectedLecture, setSelectedLecture,
    uploadDialogOpen, setUploadDialogOpen,
    detailsOpen, setDetailsOpen, detailsLecture, detailsData, loadingDetails, generating,
    deleteDialogOpen, setDeleteDialogOpen, lectureToDelete, deleteError, deleting,
    loadLectures, handleViewDetails, handleGenerateQuestions, handleDeleteClick, confirmDelete,
  };
}
