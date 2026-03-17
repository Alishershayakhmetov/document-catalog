"use client";

import { Edit, Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import CreateCategoryModal from "./createCategoryModal";
import { useAddCategory, useCatalogTree } from "@/hooks/catalog";
import DeleteCategoryModal from "./deleteCategoryModal";
import { Option, CatalogOption, SubcatalogOption, DocumentationOption} from "./types";
import EditCategoryModal from "./editCategoryModal";

type CategoryType = "mall" | "catalog" | "subcatalog" | "documentation";

type Props = {
  onClose: () => void;
  handleFilterFolders: (filters: {
    mallId: string | null;
    catalogId: string | null;
    subcatalogId: string | null;
    documentationId: string | null;
  }) => void;
  isPending?: boolean;
};

export default function FilterFolderModal({
  onClose,
  handleFilterFolders,
  isPending = false,
}: Props) {
  const [selectedMall, setSelectedMall] = useState<Option | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogOption | null>(null);
  const [selectedSubcatalog, setSelectedSubcatalog] = useState<SubcatalogOption | null>(null);
  const [selectedDocumentation, setSelectedDocumentation] = useState<DocumentationOption | null>(null);

  const [categorySelected, setCategorySelected] = useState<CategoryType | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryType | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryType|null>(null);

  const { data, isLoading, isError } = useCatalogTree();
  const { mutate: addCategory, isPending: isCategoryAdding } = useAddCategory();

  const malls = data?.mall ?? [];
  const allCatalogs = data?.catalog ?? [];
  const allSubcatalogs = data?.subcatalog ?? [];
  const allDocumentations = data?.documentation ?? [];

  const catalogs = useMemo(() => {
    if (!selectedMall) return [];
    return allCatalogs.filter((item) => item.mallId === selectedMall.id);
  }, [allCatalogs, selectedMall]);

  const subcatalogs = useMemo(() => {
    if (!selectedCatalog) return [];
    return allSubcatalogs.filter((item) => item.catalogId === selectedCatalog.id);
  }, [allSubcatalogs, selectedCatalog]);

  const documentations = useMemo(() => {
    if (!selectedSubcatalog) return [];
    return allDocumentations.filter(
      (item) => item.subcatalogId === selectedSubcatalog.id
    );
  }, [allDocumentations, selectedSubcatalog]);

  const resetForm = () => {
    setSelectedMall(null);
    setSelectedCatalog(null);
    setSelectedSubcatalog(null);
    setSelectedDocumentation(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMallChange = (mallId: string) => {
    const mall = malls.find((item) => item.id === mallId) ?? null;
    setSelectedMall(mall);
    setSelectedCatalog(null);
    setSelectedSubcatalog(null);
    setSelectedDocumentation(null);
  };

  const handleCatalogChange = (catalogId: string) => {
    const catalog = catalogs.find((item) => item.id === catalogId) ?? null;
    setSelectedCatalog(catalog);
    setSelectedSubcatalog(null);
    setSelectedDocumentation(null);
  };

  const handleSubcatalogChange = (subcatalogId: string) => {
    const subcatalog = subcatalogs.find((item) => item.id === subcatalogId) ?? null;
    setSelectedSubcatalog(subcatalog);
    setSelectedDocumentation(null);
  };

  const handleDocumentationChange = (documentationId: string) => {
    const documentation =
      documentations.find((item) => item.id === documentationId) ?? null;
    setSelectedDocumentation(documentation);
  };

  const isCatalogDisabled = !selectedMall;
  const isSubcatalogDisabled = !selectedCatalog;
  const isDocumentationDisabled = !selectedSubcatalog;

  const parentCategoryId = useMemo(() => {
    switch (categorySelected) {
      case "catalog":
        return selectedMall?.id ?? null;
      case "subcatalog":
        return selectedCatalog?.id ?? null;
      case "documentation":
        return selectedSubcatalog?.id ?? null;
      case "mall":
      default:
        return null;
    }
  }, [categorySelected, selectedMall, selectedCatalog, selectedSubcatalog]);

  const parentCategoryName = useMemo(() => {
    switch (categorySelected) {
      case "catalog":
        return selectedMall?.name ?? null;
      case "subcatalog":
        return selectedCatalog?.name ?? null;
      case "documentation":
        return selectedSubcatalog?.name ?? null;
      case "mall":
      default:
        return null;
    }
  }, [categorySelected, selectedMall, selectedCatalog, selectedSubcatalog]);

  const addNewCategory = (categoryName: CategoryType) => {
    if (categoryName === "catalog" && !selectedMall) return;
    if (categoryName === "subcatalog" && !selectedCatalog) return;
    if (categoryName === "documentation" && !selectedSubcatalog) return;

    setCategorySelected(categoryName);
  };

  const deleteCategory = (categoryName: CategoryType) => {
    if (categoryName === "catalog" && !selectedMall) return;
    if (categoryName === "subcatalog" && !selectedCatalog) return;
    if (categoryName === "documentation" && !selectedSubcatalog) return;

    setCategoryToDelete(categoryName);
  }

  const editCategory = (categoryName: CategoryType) => {
    if (categoryName === "catalog" && !selectedMall) return;
    if (categoryName === "subcatalog" && !selectedCatalog) return;
    if (categoryName === "documentation" && !selectedSubcatalog) return;

    setCategoryToEdit(categoryName);
  }

  const FilterFolders = (e: React.SubmitEvent) => {
    e.preventDefault();
    handleFilterFolders({mallId: selectedMall?.id!, catalogId: selectedCatalog?.id!, subcatalogId: selectedSubcatalog?.id!, documentationId: selectedDocumentation?.id!})
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
          <h2 className="text-xl font-semibold text-gray-900">Filter</h2>

          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mr-3 flex-1 overflow-y-auto pr-3">
          <form onSubmit={(e: React.SubmitEvent) => FilterFolders(e)} className="space-y-4">
            <div>
              <label htmlFor="mall" className="mb-2 block text-sm font-medium text-gray-700">
                Mall
              </label>

              <div className="flex gap-4">
                <select
                  id="mall"
                  value={selectedMall?.id ?? ""}
                  onChange={(e) => handleMallChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                >
                  <option value="">Select mall</option>
                  {malls.map((mall) => (
                    <option key={mall.id} value={mall.id}>
                      {mall.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => addNewCategory("mall")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Plus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteCategory("mall")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => editCategory("mall")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="catalog" className="mb-2 block text-sm font-medium text-gray-700">
                Catalog
              </label>

              <div className="flex gap-4">
                <select
                  id="catalog"
                  value={selectedCatalog?.id ?? ""}
                  onChange={(e) => handleCatalogChange(e.target.value)}
                  disabled={isCatalogDisabled}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Select catalog</option>
                  {catalogs.map((catalog) => (
                    <option key={catalog.id} value={catalog.id}>
                      {catalog.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => addNewCategory("catalog")}
                  disabled={isCatalogDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteCategory("catalog")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => editCategory("catalog")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="subcatalog" className="mb-2 block text-sm font-medium text-gray-700">
                Subcatalog
              </label>

              <div className="flex gap-4">
                <select
                  id="subcatalog"
                  value={selectedSubcatalog?.id ?? ""}
                  onChange={(e) => handleSubcatalogChange(e.target.value)}
                  disabled={isSubcatalogDisabled}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Select subcatalog</option>
                  {subcatalogs.map((subcatalog) => (
                    <option key={subcatalog.id} value={subcatalog.id}>
                      {subcatalog.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => addNewCategory("subcatalog")}
                  disabled={isSubcatalogDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteCategory("subcatalog")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => editCategory("subcatalog")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="documentation" className="mb-2 block text-sm font-medium text-gray-700">
                Documentation
              </label>

              <div className="flex gap-4">
                <select
                  id="documentation"
                  value={selectedDocumentation?.id ?? ""}
                  onChange={(e) => handleDocumentationChange(e.target.value)}
                  disabled={isDocumentationDisabled}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Select documentation</option>
                  {documentations.map((documentation) => (
                    <option key={documentation.id} value={documentation.id}>
                      {documentation.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => addNewCategory("documentation")}
                  disabled={isDocumentationDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteCategory("documentation")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => editCategory("documentation")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Edit className="h-5 w-5" />
                </button>
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
                {isPending ? "Filtering..." : "Filter"}
              </button>
            </div>
          </form>
        </div>

        {categorySelected && (
          <CreateCategoryModal
            categoryType={categorySelected}
            parentCategoryId={parentCategoryId}
            // parentCategoryName={parentCategoryName}
            onClose={() => setCategorySelected(null)}
            isPending={isCategoryAdding}
          />
        )}

        {categoryToDelete && data && (
          <DeleteCategoryModal 
            categoryType={categoryToDelete}
            categoryList={data[categoryToDelete]}
            // parentCategoryName={parentCategoryName}
            onClose={() => setCategoryToDelete(null)}
            isPending={isCategoryAdding}
          />
        )}

        {categoryToEdit && data && (
          <EditCategoryModal
            categoryType={categoryToEdit}
            categoryList={data[categoryToEdit]}
            // parentCategoryName={parentCategoryName}
            onClose={() => setCategoryToEdit(null)}
            isPending={isCategoryAdding}
          />
        )}
      </div>
    </div>
  );
}