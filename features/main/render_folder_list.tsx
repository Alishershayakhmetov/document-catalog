"use client";

import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import { Folder } from "@/hooks/folder";
import { formatDate } from "@/utils/dateUtils";

export default function FolderList({ folders }: {folders: Folder[]}) {
  const router = useRouter();

  const handleRowClick = (
    e: React.MouseEvent<HTMLDivElement>,
    folderId: string
  ) => {
    const selection = window.getSelection()?.toString();

    // if user selected text, do not navigate
    if (selection && selection.length > 0) return;

    router.push(`/folder/${folderId}`);
  };

  return (
    <div className="divide-y divide-gray-200">
      {folders.map((folder) => (
        <div
          key={folder.id}
          onClick={(e) => handleRowClick(e, folder.id)}
          className="group cursor-pointer grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-gray-50 md:grid-cols-12 md:items-center"
        >
          <div className="md:col-span-8">
            <p className="select-text text-sm font-semibold text-gray-900">
              {folder.name}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="select-text text-sm text-gray-600">
              {formatDate(folder.date)}
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
              <Paperclip className="h-4 w-4" />
              {folder.fileCount} Файл
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}