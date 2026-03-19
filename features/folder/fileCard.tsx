"use client";

import {
  Pencil,
  Check,
  FileText,
	Download,
} from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { FileCardInfo } from "@/shared/types/global";

type Props = {
	selectedFileIds: string[],
	file: FileCardInfo,
	isDeleteMode: boolean,
	toggleFileSelection: (id: string) => void,
	openEditModal: (file: FileCardInfo) => void,
	isFolderUpdating: boolean,
}

export default function FileCard({selectedFileIds, file, isDeleteMode, toggleFileSelection, openEditModal, isFolderUpdating} : Props) {
	const isSelected = selectedFileIds.includes(file.id);

	const handleDownload = async () => {
		if (isDeleteMode) {
			return;
		}
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
			className={`grid gap-4 px-5 py-4 border-b
			${isDeleteMode && isSelected ? "bg-red-50" : "hover:bg-gray-50"}
			
			// mobile
			grid-cols-1
			
			// desktop
			md:grid-cols-[2fr_1fr_1fr_2fr]
			md:grid-rows-[auto_auto]
			`}
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

			<div className="text-sm text-gray-600 min-w-0">
				{file.description}
			</div>

			<div className="text-sm text-gray-600 min-w-0">
				{formatDate(file.date)}
			</div>

			<div className="text-sm text-gray-600 break-words min-w-0">
				{file.physicalLocation}
			</div>

			<div
				className="
					flex flex-wrap gap-2
					
					// mobile
					justify-start
					
					// desktop positioning
					md:col-span-4
					md:justify-end
					md:self-end
				"
			>
				<button
					onClick={() => openEditModal(file)}
					disabled={isDeleteMode || isFolderUpdating}
					className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Pencil className="h-4 w-4" />
					Изменить
				</button>

				<button
					onClick={() => handleDownload()}
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