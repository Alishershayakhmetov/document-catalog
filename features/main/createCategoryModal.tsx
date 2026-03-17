"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import FileUploadFields from "@/features/shared/fileUploadFields";
import { useAddCategory } from "@/hooks/catalog";
import { catalogNames } from "./constant";

type Props = {
  categoryType: "mall" | "documentation" | "catalog" | "subcatalog",
  parentCategoryId: string | null;
  onClose: () => void;
  isPending?: boolean;
};

export default function CreateCategoryModal({
  categoryType,
  parentCategoryId,
  onClose,
  isPending = false,
}: Props) {
  const [newCatalogInput, setNewCatalogInput] = useState("");
  const { mutate: addCategory, isPending: isCategoryAdding } = useAddCategory();

  const resetForm = () => {
    setNewCatalogInput("")
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    addCategory({
      categoryType: categoryType,
      parentCategoryId: parentCategoryId,
      createCategoryName: newCatalogInput,
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
            Create new {catalogNames[categoryType]}
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
								<input
									type="text"
									id="newCatalogInput"
									value={newCatalogInput}
									onChange={(e) => setNewCatalogInput(e.target.value)}
									placeholder={`Enter ${catalogNames[categoryType]}`}
									className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
									required
								/>
							</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}