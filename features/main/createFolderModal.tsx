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
};

export default function CreateFolderModal({
  onClose,
  onSubmit,
  isPending = false,
}: Props) {
  const [folderName, setFolderName] = useState("");
  const [folderDate, setFolderDate] = useState("");
  // selectedPath is an array of selected node IDs, one per depth level
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);

  const { data, isLoading, isError } = useCatalogTree();

  const tree: CatalogTreeResponse[] = data ?? [];

  // Build the list of dropdowns to show.
  // Level 0: root nodes (nodes with no parent, i.e. top-level items in tree)
  // Level N: children of the selected node at level N-1
  const dropdownLevels: { nodes: CatalogTreeResponse["children"] | CatalogTreeResponse[]; label: string }[] = [];

  // First dropdown: root-level nodes
  dropdownLevels.push({ nodes: tree, label: "Категория" });

  // For each selected node in the path, find its children and add a new dropdown
  for (let i = 0; i < selectedPath.length; i++) {
    const selectedId = selectedPath[i];

    // Find the node at this level
    const levelNodes = i === 0 ? tree : dropdownLevels[i].nodes;
    const selectedNode = (levelNodes as CatalogTreeResponse[]).find((n) => n.id === selectedId);

    if (selectedNode && selectedNode.children.length > 0) {
      // We need full CatalogNode data for children — find them from the flat tree
      const childNodes = tree.filter((n) => n.parent?.id === selectedId);
      dropdownLevels.push({ nodes: childNodes, label: `Подкатегория (уровень ${i + 1})` });
    } else {
      break;
    }
  }

  const handleLevelChange = (levelIndex: number, selectedId: string) => {
    // Trim the path to this level and set the new selection
    const newPath = [...selectedPath.slice(0, levelIndex)];
    if (selectedId) newPath.push(selectedId);
    setSelectedPath(newPath);
  };

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
      categoryIds: selectedPath,
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

            {/* Dynamic category dropdowns */}
            {isLoading && (
              <p className="text-sm text-gray-400">Загрузка категорий...</p>
            )}
            {isError && (
              <p className="text-sm text-red-500">Ошибка загрузки категорий</p>
            )}
            {!isLoading &&
              !isError &&
              dropdownLevels.map((level, index) => (
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
                    {(level.nodes as CatalogTreeResponse[]).map((node) => (
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
                disabled={isPending}
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