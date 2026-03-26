"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useEditCategory, CatalogTreeResponse } from "@/hooks/catalog";

type Props = {
  categoryList: CatalogTreeResponse[] | undefined;
  onClose: () => void;
  isPending?: boolean;
};

export default function EditCategoryModal({
  categoryList,
  onClose,
  isPending = false,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const { mutate: editCategory, isPending: isCategoryEditing } = useEditCategory();

  const selectedNode = categoryList?.find((n) => n.id === selectedId) ?? null;

  const handleSelectChange = (categoryId: string) => {
    setSelectedId(categoryId);
    // Pre-fill the new name with the current name so user can edit from it
    const node = categoryList?.find((n) => n.id === categoryId);
    setNewName(node?.name ?? "");
  };

  const handleClose = () => {
    setSelectedId("");
    setNewName("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newName.trim()) return;

    editCategory({
      categoryId: selectedId,
      newName: newName.trim(),
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
            Изменить Категорию
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

            {/* Category selector */}
            <div>
              <label
                htmlFor="editCategorySelect"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Категория
              </label>
              <select
                id="editCategorySelect"
                value={selectedId}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                required
              >
                <option value="" disabled>
                  Выберите Категорию
                </option>
                {categoryList?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.parent ? `${item.parent.name} / ${item.name}` : item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* New name input — only shown after a category is selected */}
            {selectedNode && (
              <div>
                <label
                  htmlFor="newCategoryName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Новое название
                </label>
                <input
                  id="newCategoryName"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Введите новое название"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                  required
                />
                {/* Hint showing the current name */}
                <p className="mt-1 text-xs text-gray-400">
                  Текущее название:{" "}
                  <span className="font-medium text-gray-500">{selectedNode.name}</span>
                </p>
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
                disabled={isPending || isCategoryEditing || !selectedId || !newName.trim()}
                className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending || isCategoryEditing ? "Изменение..." : "Изменить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}