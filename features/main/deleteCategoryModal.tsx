"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useDeleteCategory, CatalogTreeResponse } from "@/hooks/catalog";

type Props = {
  categoryList: CatalogTreeResponse[] | undefined;
  onClose: () => void;
  isPending?: boolean;
};

export default function DeleteCategoryModal({
  categoryList,
  onClose,
  isPending = false,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const { mutate: deleteCategory, isPending: isCategoryDeleting } = useDeleteCategory();

  const handleClose = () => {
    setSelectedId("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    deleteCategory({ categoryId: selectedId });
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
            Удалить Категорию
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
              <label
                htmlFor="deleteCategorySelect"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Категория
              </label>

              <select
                id="deleteCategorySelect"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                required
              >
                <option value="" disabled>
                  Выберите Категорию
                </option>
                {categoryList?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {/* Show full path for clarity when categories are nested */}
                    {item.parent ? `${item.parent.name} / ${item.name}` : item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Confirmation detail for the selected item */}
            {selectedId && (() => {
              const node = categoryList?.find((n) => n.id === selectedId);
              return node ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Вы уверены, что хотите удалить{" "}
                  <span className="font-semibold">«{node.name}»</span>?
                  {node.children.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      Внимание: у этой категории есть {node.children.length} подкатегори
                      {node.children.length === 1 ? "я" : node.children.length < 5 ? "и" : "й"}.
                    </p>
                  )}
                </div>
              ) : null;
            })()}

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
                disabled={isPending || isCategoryDeleting || !selectedId}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending || isCategoryDeleting ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}