"use client";

import { Edit, Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import CreateCategoryModal from "./createCategoryModal";
import { useAddCategory, useCatalogTree } from "@/hooks/catalog";
import DeleteCategoryModal from "./deleteCategoryModal";
import EditCategoryModal from "./editCategoryModal";
import { CategoryType } from "@/shared/types/global";

type Props = {
  onClose: () => void;
};

export default function ManageCategoriesModal({ onClose }: Props) {
  // The selected path determines which sub-level is currently "in view"
  const [selectedPath, setSelectedPath] = useState<CategoryType[]>([]);

  const [categorySelected, setCategorySelected] = useState<string | null | "root">(null);
  const categoryModalParentId = categorySelected === "root" ? null : categorySelected;
  const [categoryToDelete, setCategoryToDelete] = useState<string | "root" | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<string | "root" | null>(null);

  const { data, isLoading, isError } = useCatalogTree();
  const { mutate: addCategory, isPending: isCategoryAdding } = useAddCategory();

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

  const getParentIdForLevel = (levelIndex: number): string | null =>
    levelIndex === 0 ? null : selectedPath[levelIndex - 1].id;

  const getCategoryListForParent = (parentId: string | null) =>
    (data ?? []).filter((cat) =>
      parentId === null ? cat.parent === null : cat.parent?.id === parentId
    );

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
          <h2 className="text-xl font-semibold text-gray-900">Управление категориями</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mr-3 flex-1 overflow-y-auto pr-3 space-y-4">

          {/* Root-level action bar */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <span className="text-sm font-medium text-gray-600">Корневые категории</span>
            <div className="flex gap-1">
              <button
                type="button"
                title="Добавить корневую категорию"
                onClick={() => setCategorySelected("root")}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <Plus className="h-3.5 w-3.5" /> Добавить
              </button>
              <button
                type="button"
                title="Изменить корневую категорию"
                onClick={() => setCategoryToEdit("root")}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <Edit className="h-3.5 w-3.5" /> Изменить
              </button>
              <button
                type="button"
                title="Удалить корневую категорию"
                onClick={() => setCategoryToDelete("root")}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <Minus className="h-3.5 w-3.5" /> Удалить
              </button>
            </div>
          </div>

          {/* Selected path rows with per-level actions */}
          {selectedPath.map((level, index) => {
            const parentId = getParentIdForLevel(index);
            const options = categories.filter((cat) =>
              parentId === null ? cat.parentId === null : cat.parentId === parentId
            );

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    {index === 0 ? "Категория" : `Подкатегория (уровень ${index})`}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Добавить подкатегорию"
                      onClick={() => setCategorySelected(level.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      <Plus className="h-3 w-3" /> Добавить
                    </button>
                    <button
                      type="button"
                      title="Изменить"
                      onClick={() => setCategoryToEdit(parentId ?? "root")}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      <Edit className="h-3 w-3" /> Изменить
                    </button>
                    <button
                      type="button"
                      title="Удалить"
                      onClick={() => setCategoryToDelete(parentId ?? "root")}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Minus className="h-3 w-3" /> Удалить
                    </button>
                  </div>
                </div>
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

          {/* Bottom "drill into next level" dropdown */}
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
                <option value="">Выбрать для управления...</option>
                {currentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Закрыть
            </button>
          </div>
        </div>

        {/* Sub-modals */}
        {categorySelected && (
          <CreateCategoryModal
            parentId={categoryModalParentId}
            onClose={() => setCategorySelected(null)}
            isPending={isCategoryAdding}
          />
        )}

        {categoryToDelete !== null && data && (
          <DeleteCategoryModal
            categoryList={getCategoryListForParent(
              categoryToDelete === "root" ? null : categoryToDelete
            )}
            onClose={() => setCategoryToDelete(null)}
            isPending={isCategoryAdding}
          />
        )}

        {categoryToEdit !== null && data && (
          <EditCategoryModal
            categoryList={getCategoryListForParent(
              categoryToEdit === "root" ? null : categoryToEdit
            )}
            onClose={() => setCategoryToEdit(null)}
            isPending={isCategoryAdding}
          />
        )}
      </div>
    </div>
  );
}
