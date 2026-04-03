"use client";

import { X } from "lucide-react";
import { useState } from "react";
import FileUploadFields from "@/features/shared/fileUploadFields";
import { useCatalogTree, CatalogTreeResponse } from "@/hooks/catalog";
import { SelectedFileItem } from "@/shared/types/global";

type Props = {
  onClose: () => void;
  onSubmit: (data: {
    folderName: string;
    folderDate: string;
    categoryIds: string[];
    files: SelectedFileItem[];
  }) => void;
  isPending?: boolean;
  /**
   * Pre-selected category path (array of IDs from root → leaf) that was
   * last clicked in the folder tree. When provided the modal will
   * auto-populate all category dropdown levels on open.
   */
  initialCategoryPath?: string[];
};

export default function CreateFolderModal({
  onClose,
  onSubmit,
  isPending = false,
  initialCategoryPath = [],
}: Props) {
  const [folderName, setFolderName] = useState("");
  const [folderDate, setFolderDate] = useState(new Date().toISOString().split('T')[0]);
  /**
   * Initialise selectedPath from the prop so the dropdowns are pre-filled
   * when the user has previously clicked a category in the tree.
   */
  const [selectedPath, setSelectedPath] = useState<string[]>(initialCategoryPath);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);

  const { data, isLoading, isError } = useCatalogTree();

  // Flat list — the API returns all nodes at all depths in one array
  const flatNodes: CatalogTreeResponse[] = data ?? [];

  // Build dropdown levels dynamically from the flat list
  // Level 0: root nodes (parent === null)
  // Level N: nodes whose parentId === selectedPath[N-1]
  const dropdownLevels: { nodes: CatalogTreeResponse[]; label: string }[] = [];

  const rootNodes = flatNodes.filter((n) => n.parent === null);
  if (rootNodes.length > 0) {
    dropdownLevels.push({ nodes: rootNodes, label: "Категория" });
  }

  for (let i = 0; i < selectedPath.length; i++) {
    const parentId = selectedPath[i];
    const children = flatNodes.filter((n) => n.parent?.id === parentId);

    if (children.length > 0) {
      dropdownLevels.push({
        nodes: children,
        label: `Подкатегория (уровень ${i + 1})`,
      });
    } else {
      break; // selected node has no children, stop adding levels
    }
  }

  const handleLevelChange = (levelIndex: number, selectedId: string) => {
    const newPath = selectedPath.slice(0, levelIndex);
    if (selectedId) newPath.push(selectedId);
    setSelectedPath(newPath);
  };

  // The deepest selected ID is the actual categoryId for the folder
  const selectedCategoryId = selectedPath.at(-1) ?? "";

  const resetForm = () => {
    setFolderName("");
    setFolderDate("");
    setSelectedFiles([]);
    setSelectedPath([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      folderName,
      folderDate,
      categoryIds: selectedPath, // full path of selected IDs
      files: selectedFiles,
    });

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white p-6 pr-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Создать Новую Папку
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mr-3 flex-1 overflow-y-auto pr-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Имя Папки
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter Folder name"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Дата папки
              </label>
              <input
                type="date"
                value={folderDate}
                onChange={(e) => setFolderDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                required
              />
            </div>

            {isLoading && (
              <p className="text-sm text-gray-400">Загрузка категорий...</p>
            )}
            {isError && (
              <p className="text-sm text-red-500">Ошибка загрузки категорий</p>
            )}

            {!isLoading && !isError && dropdownLevels.map((level, index) => (
              <div key={index}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {level.label}
                </label>
                <select
                  value={selectedPath[index] ?? ""}
                  onChange={(e) => handleLevelChange(index, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
                >
                  <option value="">Выберите {level.label}</option>
                  {level.nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <FileUploadFields
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending || !selectedCategoryId}
                className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Создание..." : "Создать"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
