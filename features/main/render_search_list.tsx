"use client"

import { FileText } from "lucide-react";
import { SearchResponse } from "@/hooks/folder";
import { useRouter } from "next/navigation";

function formatBytes(bytes: string) {
  const n = Number(bytes);
  if (isNaN(n)) return bytes;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(raw: string) {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : d.toLocaleDateString();
}

function mimeLabel(mime: string) {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  };
  return map[mime] ?? mime.split("/")[1]?.toUpperCase() ?? "FILE";
}

export default function SearchResultList({ results }: { results: SearchResponse[] }) {
	const router = useRouter();
	const handleClick = (folderId: string, fileId: string) => {
    if (window.getSelection()?.toString()) return;
		const params = new URLSearchParams(window.location.search);
  	params.set('fileId', fileId);
    router.push(fileId ? `/folder/${folderId}?${params.toString()}` : `/folder/${folderId}`);
  };

  return (
    <>
      {/* Rows */}
      {results.map((file) => (
				<div
					key={file.file_id}
					onClick={() => handleClick(file.folder_id, file.file_id)}
					className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 text-sm text-gray-700 transition hover:bg-gray-50 last:border-b-0 md:grid md:grid-cols-12 md:gap-4"
				>
					<div className="flex items-center gap-3 min-w-0 md:col-span-3">
						<FileText className="h-4 w-4 shrink-0 text-blue-500" />
						<span className="truncate font-semibold text-gray-900 md:font-medium">
							{file.systemName}
						</span>
					</div>

					<div className="flex items-center min-w-0 text-gray-600 md:col-span-3 md:text-gray-900">
						<span className="truncate italic md:not-italic">
							{file.description || "No description"}
						</span>
					</div>

					<div className="flex items-center truncate text-gray-500 md:col-span-3">
						<span className="mr-2 text-xs font-bold uppercase md:hidden">Folder:</span>
						{file.folder_name}
					</div>

					{/* Stacked or side-by-side on mobile */}
					<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 md:mt-0 md:grid md:grid-cols-3 md:col-span-3 md:text-sm md:text-gray-500">
						
						<div className="flex items-center">
							{formatDate(file.uploadedAt)}
						</div>

						<div className="flex items-center">
							{formatBytes(file.fileSize)}
						</div>

						{/* Type badge */}
						<div className="flex items-center">
							<span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
								{mimeLabel(file.mimeType)}
							</span>
						</div>
					</div>
				</div>
			))}
    </>
  );
}