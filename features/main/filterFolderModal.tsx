"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCatalogTree } from "@/hooks/catalog";
import { CategoryType } from "@/shared/types/global";

type Props = {
  onClose: () => void;
  handleFilterFolders: (filters: { categoryIds: string[] }) => void;
  isPending?: boolean;
};

export default function FilterFolderModal({
  onClose,
  handleFilterFolders,
  isPending = false,
}: Props) {
  const [selectedPath, setSelectedPath] = useState<CategoryType[]>([]);

  const { data, isLoading, isError } = useCatalogTree();

  const categories: CategoryType[] = useMemo(() => {
    if (!data) return [];
    return data
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parent?.id ?? null,
      }))
      .filter((cat) => cat.id);
  }, [data]);

  const currentParentId = selectedPath.at(-1)?.id ?? null;
  const currentCategories = useMemo(
    () =>
      categories.filter((cat) =>
        currentParentId === null
          ? cat.parentId === null
          : cat.parentId === currentParentId
      ),
    [categories, currentParentId]
  );

  const handleClose = () => {
    setSelectedPath([]);
    onClose();
  };

  const handleSelect = (levelIndex: number, categoryId: string) => {
    const newPath = selectedPath.slice(0, levelIndex);
    const selected = categories.find((c) => c.id === categoryId);
    if (selected) newPath.push(selected);
    setSelectedPath(newPath);
  };

  const handleAddLevel = (categoryId: string) => {
    const selected = categories.find((c) => c.id === categoryId);
    if (selected) setSelectedPath((prev) => [...prev, selected]);
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    handleFilterFolders({ categoryIds: selectedPath.map((p) => p.id) });
    onClose();
  };

  const getParentIdForLevel = (levelIndex: number): string | null =>
    levelIndex === 0 ? null : selectedPath[levelIndex - 1].id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white p-6 pr-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Фильтр</h2>
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

            {/* Selected path rows */}
            {selectedPath.map((level, index) => {
              const parentId = getParentIdForLevel(index);
              const options = categories.filter((cat) =>
                parentId === null ? cat.parentId === null : cat.parentId === parentId
              );

              return (
                <div key={index} className="space-y-1">
                  <span className="text-xs font-medium text-gray-500">
                    {index === 0 ? "Категория" : `Подкатегория (уровень ${index})`}
                  </span>
                  <select
                    value={level.id}
                    onChange={(e) => handleSelect(index, e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                  >
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            {/* Bottom "add next level" dropdown */}
            {isLoading && <p className="text-sm text-gray-400">Загрузка...</p>}
            {isError && <p className="text-sm text-red-500">Ошибка загрузки категорий</p>}

            {!isLoading && !isError && currentCategories.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500">
                  {selectedPath.length === 0
                    ? "Категория"
                    : `Подкатегория (уровень ${selectedPath.length})`}
                </span>
                <select
                  value=""
                  onChange={(e) => handleAddLevel(e.target.value)}
                  className="w-full rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-500 outline-none transition focus:border-gray-400"
                >
                  <option value="">Выбрать...</option>
                  {currentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                {isPending ? "Фильтрация..." : "Фильтровать"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
