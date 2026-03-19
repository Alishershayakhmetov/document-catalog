"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import FileUploadFields from "@/features/shared/fileUploadFields";
import { useAddCategory, useDeleteCategory, useEditCategory } from "@/hooks/catalog";
import { Option, CatalogOption, SubcatalogOption, DocumentationOption} from "./types";
import { catalogNames } from "./constant";

type Props = {
  categoryType: "mall" | "documentation" | "catalog" | "subcatalog",
  categoryList: Option[] | CatalogOption[] | SubcatalogOption[] | DocumentationOption[] | undefined;
  onClose: () => void;
  isPending?: boolean;
};

export default function EditCategoryModal({
  categoryType,
  categoryList,
  onClose,
  isPending = false,
}: Props) {
  const [ selectedEditCategory, setSelectedEditCategory ] = useState<Option | CatalogOption | SubcatalogOption | DocumentationOption | null>(null);
  const [ newName, setNewName ] = useState("");
	const { mutate: editCategory, isPending: isCategoryEditing } = useEditCategory();

  const handleEditCategory = (categoryId: string) => {
    if (!categoryList) return;
    const selected = categoryList.find((item) => item.id === categoryId) ?? null;
    setSelectedEditCategory(selected);
  };

  const resetForm = () => {
    setSelectedEditCategory(null)
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    editCategory({
      categoryType: categoryType,
      categoryId: selectedEditCategory?.id!,
			newName: newName
    })
		onClose();
  }

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
            Изменить {catalogNames[categoryType]}
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
              <label htmlFor="newCatalogInput" className="mb-2 block text-sm font-medium text-gray-700">
                {catalogNames[categoryType]}
              </label>
							<div className="flex">
								<select
									id="newCatalogInput"
									value={selectedEditCategory?.id || ""}
									onChange={(e) => handleEditCategory(e.target.value)}
									className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
									required
								>
								<option value="" disabled>
									Выберите {catalogNames[categoryType]}
								</option>

								{categoryList && categoryList.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
								</select>
							</div>
            </div>

						<div> 

						</div>

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
                {isPending ? "Изменение..." : "Изменить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}