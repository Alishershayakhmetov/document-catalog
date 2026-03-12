"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Share2,
  X,
  Check,
  FileText,
  CalendarDays,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useFolderById } from "@/hooks/folder";
import { useUpdateFolder } from "@/hooks/folder";
import { formatDate } from "@/utils/dateUtils";
import { useUpdateFile } from "@/hooks/file";
import EditFileModal from "@/features/folder/editFile";

type FolderFile = {
  id: string;
  systemName: string;
  date: string;
  physicalLocation: string;
};

type Props = {
	selectedFileIds: string[],
	file: FolderFile,
	isDeleteMode: boolean,
	toggleFileSelection: (id: string) => void,
	openEditModal: (file: FolderFile) => void,
	handleShare: (file: FolderFile) => Promise<void>,
	isFolderUpdating: boolean,
}

export default function FileCard({selectedFileIds, file, isDeleteMode, toggleFileSelection, openEditModal, handleShare, isFolderUpdating} : Props) {
	const isSelected = selectedFileIds.includes(file.id);

	const handleDownload = async () => {
    try {
      const response = await fetch(`/api/file/${file.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${file.systemName}`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
        if (match?.[1]) {
          filename = decodeURIComponent(match[1].replace(/"/g, ""));
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };


	return (
		<div
			onClick={handleDownload}
			className={`grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[2.2fr_1fr_2.4fr_auto] md:items-center ${
				isDeleteMode && isSelected ? "bg-red-50" : "hover:bg-gray-50"
			}`}
		>
			<div className="min-w-0">
				<div className="flex min-w-0 items-center gap-3">
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

					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-gray-900">
							{file.systemName}
						</p>
					</div>
				</div>
			</div>

			<div className="min-w-0">
				<div className="text-sm text-gray-600">{formatDate(file.date)}</div>
			</div>

			<div className="min-w-0">
				<div className="break-words text-sm text-gray-600">
					{file.physicalLocation}
				</div>
			</div>

			<div className="min-w-0">
				<div className="flex flex-wrap gap-2 md:justify-end">
					<button
						onClick={() => openEditModal(file)}
						disabled={isDeleteMode || isFolderUpdating}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Pencil className="h-4 w-4" />
						Edit
					</button>

					<button
						onClick={() => handleShare(file)}
						disabled={isDeleteMode}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Share2 className="h-4 w-4" />
						Share
					</button>
				</div>
			</div>
		</div>
	)
}