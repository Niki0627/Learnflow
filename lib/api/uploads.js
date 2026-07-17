import { ApiError, badRequest } from "./errors.js";

const MAX_EXTRACTED_CHARS = 80000;
const MAX_PDF_PAGES = 80;

function isPdfFile(file) {
  const name = String(file?.name || "").toLowerCase();
  return file?.type === "application/pdf" || name.endsWith(".pdf");
}

function isTextFile(file) {
  const name = String(file?.name || "").toLowerCase();
  return (
    file?.type?.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv")
  );
}

export async function readMultipartFormData(request) {
  try {
    return await request.formData();
  } catch {
    throw new ApiError("Could not read the uploaded file. Please upload a file smaller than 50 MB.", 413, "UPLOAD_TOO_LARGE");
  }
}

export function getRequiredFile(formData, fieldName = "file") {
  const file = formData.get(fieldName);
  if (!file || typeof file.arrayBuffer !== "function") {
    throw badRequest("Please choose a file to upload.");
  }
  return file;
}

export function getFiles(formData, fieldName = "files") {
  return formData
    .getAll(fieldName)
    .filter((file) => file && typeof file.arrayBuffer === "function");
}

export async function extractTextFromPdf(file) {
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    useSystemFonts: true,
  });

  const document = await loadingTask.promise;
  const pageCount = Math.min(document.numPages, MAX_PDF_PAGES);
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) pages.push(text);
      page.cleanup();

      if (pages.join("\n\n").length >= MAX_EXTRACTED_CHARS) break;
    }
  } finally {
    await document.destroy();
  }

  return pages.join("\n\n").slice(0, MAX_EXTRACTED_CHARS).trim();
}

export async function extractUploadedFileText(file) {
  if (!file) return "";

  if (isPdfFile(file)) {
    try {
      const text = await extractTextFromPdf(file);
      if (text) return text;
    } catch (error) {
    }
    return `Uploaded PDF: ${file.name || "document"}. No selectable text could be extracted from this file. You can paste lecture text manually or use a PDF with selectable text for AI-generated study content.`;
  }

  if (isTextFile(file) && typeof file.text === "function") {
    return (await file.text()).slice(0, MAX_EXTRACTED_CHARS).trim();
  }

  return `Uploaded file: ${file.name || "document"}. Text extraction is supported for PDF and plain-text files.`;
}
