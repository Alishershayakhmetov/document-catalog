"use client";

import { useState } from "react";
import {
  Pencil,
  Check,
  FileText,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { FileCardInfo } from "@/shared/types/global";
import { canPreviewFile } from "@/utils/previewSupport";

const OFFICE_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.presentation",
]);

function isOfficeFile(mimeType: string | null | undefined): boolean {
  return !!mimeType && OFFICE_MIME_TYPES.has(mimeType.toLowerCase());
}

type Props = {
  selectedFileIds: string[];
  file: FileCardInfo;
  isDeleteMode: boolean;
  toggleFileSelection: (id: string) => void;
  openEditModal: (file: FileCardInfo) => void;
  isFolderUpdating: boolean;
};

export default function FileCard({
  selectedFileIds,
  file,
  isDeleteMode,
  toggleFileSelection,
  openEditModal,
  isFolderUpdating,
}: Props) {
  const isSelected = selectedFileIds.includes(file.id);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // ── Download (unchanged) ────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (isDeleteMode) return;
    try {
      const response = await fetch(`/api/file/${file.id}`, { method: "GET" });
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = file.systemName;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
        if (match?.[1]) filename = decodeURIComponent(match[1].replace(/"/g, ""));
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename!;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Не удалось скачать файл");
    }
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const handlePreviewWithNoOfficeCachePossible = async () => {
    if (isDeleteMode) return;

    // Non-office files: open the existing download endpoint directly in a new
    // tab. The browser will render PDFs and images natively. No server changes.
    if (!isOfficeFile(file.mimeType)) {
      window.open(`/api/file/${file.id}`, "_blank", "noopener,noreferrer");
      return;
    }

    // Office files: enqueue conversion if needed, then open the preview page.
    setIsPreviewLoading(true);
    try {
      await fetch(`/api/files/${file.id}/preview`, { method: "POST" });
    } catch {
      // Enqueue errors are non-fatal — the preview page handles pending/failed
      // states itself, so we open it regardless.
    } finally {
      setIsPreviewLoading(false);
    }

    window.open(`/preview/${file.id}`, "_blank", "noopener,noreferrer");
  };

  const handlePreview = async () => {
		if (isDeleteMode) return;
		window.open(`/api/file/${file.id}/preview?fallback=1`, "_blank", "noopener,noreferrer");
	};

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`grid gap-4 px-5 py-4 border-b
      ${isDeleteMode && isSelected ? "bg-red-50" : "hover:bg-gray-50"}
      grid-cols-1
      md:grid-cols-[2fr_1fr_1fr_2fr]
      md:grid-rows-[auto_auto]`}
    >
      <div className="min-w-0 flex items-center gap-3">
        {isDeleteMode && (
          <button
            onClick={() => toggleFileSelection(file.id)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
              isSelected
                ? "border-red-600 bg-red-600 text-white"
                : "border-gray-300 bg-white text-transparent"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="shrink-0 rounded-xl bg-gray-100 p-2">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>

        <p className="truncate text-sm font-semibold text-gray-900">
          {file.systemName}
        </p>
      </div>

      <div className="text-sm text-gray-600 min-w-0">{file.description}</div>
      <div className="text-sm text-gray-600 min-w-0">{formatDate(file.date)}</div>
      <div className="text-sm text-gray-600 break-words min-w-0">{file.physicalLocation}</div>

      <div
        className="
          flex flex-wrap gap-2
          justify-start
          md:col-span-4
          md:justify-end
          md:self-end
        "
      >
        {/* Preview button */}
        {canPreviewFile(file.mimeType || '', file.systemName).supported && (
          <button
            onClick={handlePreview}
            disabled={isDeleteMode || isPreviewLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreviewLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Просмотр
          </button>
        )}

        <button
          onClick={() => openEditModal(file)}
          disabled={isDeleteMode || isFolderUpdating}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" />
          Изменить
        </button>

        <button
          onClick={handleDownload}
          disabled={isDeleteMode}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Скачать
        </button>
      </div>
    </div>
  );
}
