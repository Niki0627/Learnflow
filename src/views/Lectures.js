import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, PlayCircle, Loader2, Search, Plus, UploadCloud, X, Check, Trash2, Maximize, ExternalLink, CalendarDays, BookOpen, Layers,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NotesSidebar from '../components/NotesSidebar';
import { captureSelectedText } from '../components/PDFTextSelector';
import { subjectToColor } from '../utils/subjectColors';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const getFileType = (filename) => {
    if (!filename) return 'unknown';
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'aac'].includes(ext)) return 'audio';
    return 'unknown';
};
// Only return a URL we can actually load in react-pdf (must be absolute)
const getFileUrl = (file) => {
    if (!file) return null;
    if (/^(https?:|blob:|data:)/.test(file)) return file;
    // Relative path — try to prepend the media base URL if configured
    const baseUrl = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '').replace(/\/$/, '');
    if (baseUrl) return `${baseUrl}/${file.replace(/^\//, '')}`;
    // If just a filename with no base URL, we cannot load it
    return null;
};

// Only flag as previewable when we have a real fetchable URL
const hasPreviewableFileUrl = (fileUrl) => Boolean(fileUrl && /^(https?:|blob:|data:)/.test(fileUrl));

const FileViewer = ({ lecture }) => {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [selectedText, setSelectedText] = useState('');
    const [previewError, setPreviewError] = useState('');
    const viewerRef = useRef(null);

    // Keyboard Navigation for PDF
    useEffect(() => {
        if (getFileType(lecture?.file) !== 'pdf') return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                setPageNumber(p => Math.max(1, p - 1));
            } else if (e.key === 'ArrowRight') {
                setPageNumber(p => Math.min(numPages || p, p + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lecture?.file, numPages]);

    const fileType = getFileType(lecture?.file);
    const fileUrl = getFileUrl(lecture?.file);
    const canPreviewFile = hasPreviewableFileUrl(fileUrl);

    useEffect(() => {
        setNumPages(0);
        setPageNumber(1);
        setScale(1.0);
        setSelectedText('');
        setPreviewError('');
    }, [lecture?.id, lecture?.file]);

    const handleMouseUp = () => {
        const text = captureSelectedText();
        setSelectedText(text);
        if (text) {
            window.lastSelectedPdfText = text;
        }
    };

    const dispatchSelection = () => {
        const text = selectedText || captureSelectedText() || window.lastSelectedPdfText || '';
        if (!text.trim()) return;
        window.lastSelectedPdfText = text;
        window.dispatchEvent(new CustomEvent('lf:pdf-selection', {
            detail: { text, lectureId: lecture?.id, pageNumber },
        }));
        setSelectedText('');
        const selection = window.getSelection?.();
        if (selection && selection.removeAllRanges) selection.removeAllRanges();
    };

    if (!lecture) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
                <FileText size={80} className="opacity-20" />
                <h3 className="text-xl font-bold">Select a lecture to preview</h3>
                <p className="text-sm">Click any lecture card to view its content here</p>
            </div>
        );
    }

    if (!lecture.file || !canPreviewFile) {
        // Determine if this is an old-format lecture (file_path = just a filename, not a URL)
        const hasFilename = Boolean(lecture.file && !lecture.file.startsWith('http'));

        return (
            <div className="flex h-full flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar bg-card">
                <div className="mx-auto w-full max-w-3xl">
                    {/* Header */}
                    <div className="mb-8 flex items-start gap-4 pb-6 border-b border-border/50">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/10">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-foreground mb-1">
                                {lecture.file ? 'Document Content' : 'Text Lesson'}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground">
                                {lecture.file ? 'Displaying extracted text content.' : 'This lecture was added as plain text.'}
                            </p>
                        </div>
                    </div>

                    {/* Notice banner for old-format uploads */}
                    {hasFilename && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                            <span className="mt-0.5 flex-shrink-0 text-amber-500">⚠️</span>
                            <div>
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">PDF preview not available for this lecture</p>
                                <p className="text-xs font-medium text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                                    This file was uploaded before PDF storage was enabled. Re-upload the PDF to enable live preview. The extracted text is shown below.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                        {lecture.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {lecture.content}
                            </ReactMarkdown>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-border/50 bg-background/50 p-12 text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-base font-bold text-muted-foreground">No text content available for this lecture.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }


    const showPdfSelectionButton = fileType === 'pdf' && Boolean(selectedText) && !previewError;

    return (
        <div ref={viewerRef} className="relative flex h-full flex-col bg-background/50" onMouseUp={handleMouseUp}>
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="truncate font-bold">{lecture.title}</h4>
                        <p className="text-xs text-muted-foreground">
                            {fileType === 'pdf' ? `Page ${pageNumber}${numPages ? ` / ${numPages}` : ''}` : 'Preview'}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                    {fileType === 'pdf' && (
                        <>
                            {/* Pagination Group */}
                            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/50 px-1 py-1 shadow-sm">
                                <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold w-16 text-center tabular-nums text-foreground">
                                    {pageNumber} <span className="text-muted-foreground font-medium">/ {numPages || '?'}</span>
                                </span>
                                <button disabled={numPages && pageNumber >= numPages} onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Zoom Group */}
                            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/50 px-1 py-1 shadow-sm">
                                <button disabled={scale <= 0.5} onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                                    <ZoomOut size={16} />
                                </button>
                                <span className="text-xs font-bold w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
                                <button disabled={scale >= 3.0} onClick={() => setScale(s => Math.min(3.0, +(s + 0.2).toFixed(1)))} className="p-1 hover:bg-muted disabled:opacity-30 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                                    <ZoomIn size={16} />
                                </button>
                            </div>
                        </>
                    )}
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2 rounded-lg hover:bg-muted border border-border/50 bg-background/50 shadow-sm transition-colors text-muted-foreground hover:text-foreground" title="Open in new tab">
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            <div className={cn("flex flex-1 flex-col items-center overflow-y-auto p-6 custom-scrollbar relative", fileType === 'pdf' ? 'bg-[#0f0f13]' : 'bg-muted/30')}>
                {previewError ? (
                    <div className="rounded-xl bg-blue-500/10 p-4 text-blue-500 border border-blue-500/20 max-w-lg text-sm">
                        {previewError}
                    </div>
                ) : fileType === 'pdf' ? (
                    <Document
                        file={fileUrl}
                        loading={<div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-primary w-10 h-10" /><span className="text-sm font-medium text-muted-foreground">Loading PDF...</span></div>}
                        onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
                        onLoadError={() => setPreviewError('This PDF preview is not available, but the lecture text was saved and can still be used for study aids.')}
                        error={<div className="text-white text-sm bg-red-500/20 p-4 rounded-xl border border-red-500/30">PDF preview is not available.</div>}
                        className="flex flex-col items-center"
                    >
                        <div className="relative group transition-transform duration-200">
                            <Page
                                pageNumber={Math.min(pageNumber, numPages || pageNumber)}
                                scale={scale}
                                renderTextLayer
                                renderAnnotationLayer={false}
                                className="shadow-2xl shadow-black/40 rounded-sm overflow-hidden border border-white/10"
                            />
                        </div>
                    </Document>
                ) : fileType === 'image' ? (
                    <img src={fileUrl} alt={lecture.title} className="max-w-full rounded-xl object-contain shadow-lg" />
                ) : fileType === 'video' ? (
                    <video controls className="w-full max-w-4xl rounded-xl shadow-lg"><source src={fileUrl} /></video>
                ) : fileType === 'audio' ? (
                    <audio controls className="w-full max-w-md mt-10"><source src={fileUrl} /></audio>
                ) : (
                    <div className="rounded-xl bg-blue-500/10 p-4 text-blue-500 border border-blue-500/20">Preview not available</div>
                )}
            </div>

            {showPdfSelectionButton && (
                <div className="absolute bottom-6 right-6 z-20">
                    <button onClick={dispatchSelection} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95">
                        Add selection to notes
                    </button>
                </div>
            )}
        </div>
    );
};

const StudyAidsPanel = ({ lecture }) => {
    const [tab, setTab] = useState('notes');
    const formulas = lecture?.formulas || [];
    const keyPoints = lecture?.key_points || [];

    return (
        <div className="flex h-full flex-col bg-card">
            <div className="shrink-0 border-b px-6 py-4">
                <h3 className="text-lg font-bold">AI Study Aids</h3>
                <p className="text-sm text-muted-foreground">Study notes, formulas, and key points</p>
            </div>
            
            <div className="flex shrink-0 gap-2 border-b px-4 py-2 overflow-x-auto custom-scrollbar">
                <button onClick={() => setTab('notes')} className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors", tab === 'notes' ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>Notes</button>
                <button onClick={() => setTab('formulas')} className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors whitespace-nowrap", tab === 'formulas' ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>Formulas ({formulas.length})</button>
                <button onClick={() => setTab('points')} className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors whitespace-nowrap", tab === 'points' ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>Key Points ({keyPoints.length})</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {tab === 'notes' && (
                    lecture?.study_notes ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lecture.study_notes}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No study notes generated yet.</div>
                    )
                )}

                {tab === 'formulas' && (
                    <div className="space-y-4">
                        {formulas.length > 0 ? formulas.map((f, i) => (
                            <div key={i} className="rounded-xl border bg-muted/30 p-4">
                                <h4 className="font-bold text-sm mb-2">{f.name || `Formula ${i + 1}`}</h4>
                                <code className="block rounded-lg bg-background p-3 font-mono text-sm border shadow-sm">{f.formula || '—'}</code>
                                {f.description && <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>}
                            </div>
                        )) : <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No formulas extracted yet.</div>}
                    </div>
                )}

                {tab === 'points' && (
                    <div className="space-y-3">
                        {keyPoints.length > 0 ? keyPoints.map((p, i) => (
                            <div key={i} className="rounded-xl border bg-muted/30 p-4 text-sm font-medium leading-relaxed">
                                {p}
                            </div>
                        )) : <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No key points extracted yet.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

const LectureDetailsModal = ({ open, onClose, lecture, details, detailLecture, loading, onGenerateQuestions, generating }) => {
    const [tab, setTab] = useState('questions');
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold">{lecture?.title}</h2>
                        <p className="text-sm text-muted-foreground">Generated Content & Analysis</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-muted text-muted-foreground"><X size={20} /></button>
                </div>
                
                <div className="flex shrink-0 gap-2 border-b px-4 py-2 bg-muted/10">
                    <button onClick={() => setTab('questions')} className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2", tab === 'questions' ? "bg-card shadow text-foreground border" : "hover:bg-muted text-muted-foreground border border-transparent")}><FileText size={16}/> Questions</button>
                    <button onClick={() => setTab('summary')} className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2", tab === 'summary' ? "bg-card shadow text-foreground border" : "hover:bg-muted text-muted-foreground border border-transparent")}><BookOpen size={16}/> Summary</button>
                    <button onClick={() => setTab('studi-aids')} className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2", tab === 'studi-aids' ? "bg-card shadow text-foreground border" : "hover:bg-muted text-muted-foreground border border-transparent")}><Layers size={16}/> Study Aids</button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {loading ? (
                        <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="flex h-full flex-col overflow-hidden">
                            {tab === 'questions' && (
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="text-primary" size={24} />
                                            <h3 className="text-lg font-bold">Generated Questions</h3>
                                            {details?.questions?.length > 0 && (
                                                <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                                    {details.questions.length} questions
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => onGenerateQuestions(lecture.id)} disabled={generating} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold hover:bg-muted disabled:opacity-50">
                                            {generating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                            {generating ? 'Generating...' : 'Regenerate'}
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {details?.questions?.map((q, idx) => (
                                            <div key={q.id} className="rounded-2xl border bg-card p-6 shadow-sm">
                                                <div className="mb-4 flex items-start justify-between gap-4">
                                                    <div className="prose prose-sm dark:prose-invert font-semibold">
                                                        <span>{idx + 1}. </span>
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question_text || ''}</ReactMarkdown>
                                                    </div>
                                                    <div className="flex shrink-0 flex-wrap gap-1 justify-end">
                                                        {q.question_type && <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">{q.question_type.replace('_', ' ').toUpperCase()}</span>}
                                                        {q.blooms_level && <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">{q.blooms_level.toUpperCase()}</span>}
                                                        {q.is_high_yield && <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">HIGH YIELD</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    {['A', 'B', 'C', 'D'].map(opt => q[`option_${opt.toLowerCase()}`] && (
                                                        <div key={opt} className={cn("flex gap-3 rounded-xl border p-3 text-sm", q.correct_option === opt ? "border-emerald-500 bg-emerald-500/10" : "bg-muted/30")}>
                                                            {q.correct_option === opt && <Check className="mt-0.5 shrink-0 text-emerald-500" size={16} />}
                                                            <div className="flex gap-2">
                                                                <span className="font-bold">{opt}.</span>
                                                                <div className="prose prose-sm dark:prose-invert">
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{q[`option_${opt.toLowerCase()}`] || ''}</ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {q.explanation && (
                                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-muted-foreground">
                                                        <span className="block mb-1 font-bold text-amber-600 uppercase text-[10px] tracking-wider">Explanation</span>
                                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {!details?.questions?.length && (
                                            <div className="rounded-2xl border border-dashed p-8 text-center">
                                                <p className="mb-4 text-muted-foreground">No questions generated yet.</p>
                                                <button onClick={() => onGenerateQuestions(lecture.id)} disabled={generating} className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground">
                                                    Generate Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {tab === 'summary' && (
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-base leading-loose text-muted-foreground">
                                    {details?.summary ? details.summary : <div className="rounded-xl border border-dashed p-8 text-center">No summary available for this lecture yet.</div>}
                                </div>
                            )}

                            {tab === 'studi-aids' && lecture && (
                                <div className="flex-1 overflow-hidden">
                                    <StudyAidsPanel lecture={detailLecture || details} lectureId={lecture.id} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/10 p-4">
                    <button onClick={onClose} className="rounded-full px-6 py-2 font-bold hover:bg-muted">Close</button>
                    <button onClick={() => window.location.href = `/quiz-mode?noteId=${lecture?.id}&n=10`} disabled={!details?.questions?.length} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        <PlayCircle size={18} /> Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

const LectureCard = ({ lecture, onDelete, onViewDetails, onSelect, isSelected }) => {
    const fileType = getFileType(lecture.file);
    const subjectColor = subjectToColor(lecture.subject || 'General');
    
    return (
        <div 
            onClick={() => onSelect && onSelect(lecture)}
            className={cn(
                "group cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300",
                isSelected ? "bg-primary/5 shadow-md" : "border-border bg-card hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            )}
            style={{ borderColor: isSelected ? subjectColor : undefined }}
        >
            <div className="flex items-start gap-4">
                <div 
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${subjectColor}ee 0%, ${subjectColor} 100%)` }}
                >
                    <FileText size={24} />
                </div>
                
                <div className="flex flex-1 flex-col min-w-0">
                    <h4 className="truncate font-bold text-foreground mb-1">{lecture.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="rounded-md px-2 py-0.5 text-white shadow-sm" style={{ backgroundColor: subjectColor }}>{lecture.subject || 'General'}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><CalendarDays size={12}/> {new Date(lecture.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-600 border border-emerald-500/20"><Check size={12}/> Processed</span>
                        {(lecture.study_notes || lecture.key_points?.length > 0) && (
                             <span className="flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-teal-600 border border-teal-500/20"><FileText size={12}/> Notes Ready</span>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onViewDetails(lecture)} className="rounded p-2 text-primary hover:bg-primary/10 transition-colors" title="View Details"><Maximize size={16}/></button>
                    <button onClick={() => onDelete(lecture)} className="rounded p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16}/></button>
                </div>
            </div>
        </div>
    );
};

const UploadPanel = ({ onUploadSuccess }) => {
    const [uploadTab, setUploadTab] = useState('upload');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) setPdfFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false
    });

    const handleUpload = async () => {
        if (!title.trim()) return;
        setUploading(true); setError('');
        try {
            if (uploadTab === 'text') {
                await API.post('upload-note/', { title, content });
            } else {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('file', pdfFile);
                await API.post('upload-pdf/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setTitle(''); setContent(''); setPdfFile(null);
            setShowSuccess(true); setTimeout(() => setShowSuccess(false), 4000);
            onUploadSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const isDisabled = uploading || !title.trim() || (uploadTab === 'text' && !content.trim()) || (uploadTab === 'upload' && !pdfFile);

    return (
        <div className="flex flex-col gap-6 p-2">
            <div className="flex gap-2 rounded-xl bg-muted/50 p-1">
                <button onClick={() => setUploadTab('upload')} className={cn("flex-1 rounded-lg py-2 text-sm font-bold transition-all", uploadTab === 'upload' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-muted")}>Upload PDF</button>
                <button onClick={() => setUploadTab('text')} className={cn("flex-1 rounded-lg py-2 text-sm font-bold transition-all", uploadTab === 'text' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:bg-muted")}>Paste Text</button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-bold text-muted-foreground">Lecture Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Intro to Biology" />
                </div>

                {uploadTab === 'text' ? (
                     <div>
                        <label className="mb-1 block text-sm font-bold text-muted-foreground">Content</label>
                        <textarea rows={7} value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none custom-scrollbar" placeholder="Paste your lecture notes here..." />
                    </div>
                ) : (
                    <div {...getRootProps()} className={cn("flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors", isDragActive ? "border-primary bg-primary/5" : pdfFile ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-primary/50 hover:bg-muted/30")}>
                        <input {...getInputProps()} />
                        {pdfFile ? (
                            <>
                                <Check size={40} className="mb-2 text-emerald-500" />
                                <p className="font-bold text-emerald-600">{pdfFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={40} className="mb-2 text-muted-foreground" />
                                <p className="font-bold text-muted-foreground">{isDragActive ? 'Drop here!' : 'Click or drag PDF'}</p>
                                <p className="text-xs text-muted-foreground opacity-70">Max 25MB</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            <button onClick={handleUpload} disabled={isDisabled} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 flex items-center justify-center">
                {uploading ? <Loader2 className="animate-spin" /> : 'Generate Content'}
            </button>

            {showSuccess && <div className="rounded-xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600 border border-emerald-500/20 text-center">Uploaded successfully! Processing your material...</div>}
            {error && <div className="rounded-xl bg-red-500/10 p-4 text-sm font-bold text-red-600 border border-red-500/20 text-center">{error}</div>}
        </div>
    );
};

export default function Lectures() {
    useAuth();
    const navigate = useNavigate();

    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLecture, setDetailsLecture] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [detailLecture, setDetailLecture] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [lectureToDelete, setLectureToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const fetchLectures = useCallback(async () => {
        try {
            const response = await API.get('lectures/');
            setLectures(response.data);
            if (!selectedLecture && response.data.length > 0) setSelectedLecture(response.data[0]);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    }, [selectedLecture]);

    useEffect(() => {
        fetchLectures();
    }, [fetchLectures]);

    const filteredLectures = lectures.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const groupedLectures = filteredLectures.reduce((acc, lecture) => {
        const subject = lecture.subject || 'General';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(lecture);
        return acc;
    }, {});

    const handleViewDetails = async (lecture) => {
        setDetailsLecture(lecture); setDetailsOpen(true); setLoadingDetails(true); setDetailLecture(null);
        try {
            const res = await API.get(`lectures/${lecture.id}/`);
            setDetailsData(res.data); setDetailLecture(res.data);
        } catch (err) {
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleGenerateQuestions = async (noteId) => {
        setGenerating(true);
        try {
            await API.post('generate-mcqs/', { note_id: noteId, count: 10 });
            const res = await API.get(`lectures/${noteId}/`);
            setDetailsData(res.data);
        } catch (err) {
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteClick = (lecture) => {
        setLectureToDelete(lecture);
        setDeleteError('');
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!lectureToDelete) return;
        setDeleting(true);
        setDeleteError('');
        try {
            await API.delete(`lectures/${lectureToDelete.id}/`);
            setLectures(prev => prev.filter(l => l.id !== lectureToDelete.id));
            if (selectedLecture?.id === lectureToDelete.id) setSelectedLecture(null);
            setDeleteDialogOpen(false);
            setLectureToDelete(null);
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to delete lecture. Please try again.';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] min-h-[600px] flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex shrink-0 items-end justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Lecture Library</h1>
                    <p className="font-medium text-muted-foreground mt-1">Organized by subject for seamless studying.</p>
                </div>
                <button onClick={() => setUploadDialogOpen(true)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <Plus size={18} /> Add Material
                </button>
            </div>

            <div className="flex min-h-0 flex-1 gap-6">
                {/* Sidebar Library */}
                <div className="flex w-[320px] shrink-0 flex-col rounded-3xl border bg-card shadow-sm overflow-hidden">
                    <div className="border-b p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input type="text" placeholder="Search lectures..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-muted/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors focus:bg-background focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                        ) : Object.keys(groupedLectures).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <BookOpen size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">No lectures found</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedLectures).map(([subject, subLectures]) => (
                                    <div key={subject}>
                                        <div className="mb-3 flex items-center gap-2 px-1">
                                            <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: subjectToColor(subject) }} />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{subject}</h3>
                                            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{subLectures.length}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {subLectures.map(lecture => (
                                                <LectureCard key={lecture.id} lecture={lecture} isSelected={selectedLecture?.id === lecture.id} onSelect={setSelectedLecture} onDelete={handleDeleteClick} onViewDetails={handleViewDetails} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Viewer Area */}
                <div className="flex min-w-0 flex-1 gap-6">
                    {selectedLecture ? (
                        <>
                            <div className="flex flex-[2] flex-col overflow-hidden rounded-3xl border bg-card shadow-sm relative">
                                <div className="absolute inset-0 z-0">
                                   <FileViewer lecture={selectedLecture} />
                                </div>
                            </div>
                            <div className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
                                <NotesSidebar lectureId={selectedLecture.id} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/50 text-muted-foreground shadow-inner">
                            <BookOpen size={80} className="mb-6 opacity-20" />
                            <h2 className="text-2xl font-bold">No Lecture Selected</h2>
                            <p className="mt-2 font-medium">Select a lecture from the library to view it here.</p>
                        </div>
                    )}
                </div>
            </div>

            <LectureDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} lecture={detailsLecture} details={detailsData} detailLecture={detailLecture} loading={loadingDetails} onGenerateQuestions={handleGenerateQuestions} generating={generating} />

            {uploadDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black">Add New Material</h2>
                            <button onClick={() => setUploadDialogOpen(false)} className="rounded-full p-2 hover:bg-muted text-muted-foreground"><X size={20} /></button>
                        </div>
                        <UploadPanel onUploadSuccess={() => { fetchLectures(); setUploadDialogOpen(false); }} />
                    </div>
                </div>
            )}

            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h2 className="text-xl font-black mb-2">Delete Lecture?</h2>
                        <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete <strong>"{lectureToDelete?.title}"</strong>? This action cannot be undone.</p>

                        {deleteError && (
                            <div className="mb-4 rounded-xl border border-red-200/60 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 text-left">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button disabled={deleting} onClick={() => { setDeleteDialogOpen(false); setDeleteError(''); }} className="flex-1 rounded-full bg-muted py-3 font-bold text-muted-foreground hover:bg-muted/80 disabled:opacity-50">Cancel</button>
                            <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-full bg-red-500 py-3 font-bold text-white hover:bg-red-600 shadow-lg shadow-red-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
                                {deleting ? <><Loader2 size={16} className="animate-spin" /> Deleting…</> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
