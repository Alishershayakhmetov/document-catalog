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
  handleFilterFolders: (filters: {
    categoryIds: string[]
  }) => void;
  isPending?: boolean;
};

export default function FilterFolderModal({
  onClose,
  handleFilterFolders,
  isPending = false,
}: Props) {
  // const [selectedMall, setSelectedMall] = useState<Option | null>(null);
  // const [selectedCatalog, setSelectedCatalog] = useState<CatalogOption | null>(null);
  // const [selectedSubcatalog, setSelectedSubcatalog] = useState<SubcatalogOption | null>(null);
  // const [selectedDocumentation, setSelectedDocumentation] = useState<DocumentationOption | null>(null);

  const [selectedPath, setSelectedPath] = useState<CategoryType[]>([]);
  const currentParentId = selectedPath.at(-1)?.id ?? null;

  const [categorySelected, setCategorySelected] = useState<string | null>(null); 
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null); 
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);

  const { data, isLoading, isError } = useCatalogTree();

  const categories: CategoryType[] = useMemo(() => {
    if (!data) return [];

    return data.map(cat => ({
      id: cat.id,
      name: cat.name,
      parentId: cat.parent?.id ?? null,
    }));
  }, [data]);

  // const currentCategories = useMemo(() => {
  //   return data?.filter(cat => cat.parent?.id === currentParentId) ?? [];
  // }, [data, currentParentId]);

  // const currentCategories = useMemo(() => {
  //   if (!data) return [];

  //   // root level
  //   if (selectedPath.length === 0) {
  //     return data.filter(cat => !cat.parent);
  //   }

  //   // last selected node → show its children
  //   return selectedPath[selectedPath.length - 1].children || [];
  // }, [data, selectedPath]);

  const currentCategories = useMemo(() => {
    const parentId = selectedPath.at(-1)?.id ?? null;

    return categories.filter(cat => cat.parentId === parentId);
  }, [categories, selectedPath]);

  const { mutate: addCategory, isPending: isCategoryAdding } = useAddCategory();

  const resetForm = () => {
    setSelectedPath([])
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addNewCategory = () => {
    setCategorySelected(currentParentId)
  };

  const deleteCategory = () => {
    // if (categoryName === "catalog" && !selectedMall) return;
    // if (categoryName === "subcatalog" && !selectedCatalog) return;
    // if (categoryName === "documentation" && !selectedSubcatalog) return;

    setCategoryToDelete(currentParentId);
  }

  const editCategory = () => {
    // if (categoryName === "catalog" && !selectedMall) return;
    // if (categoryName === "subcatalog" && !selectedCatalog) return;
    // if (categoryName === "documentation" && !selectedSubcatalog) return;

    setCategoryToEdit(currentParentId);
  }

  const FilterFolders = (e: React.SubmitEvent) => {
    e.preventDefault();
    handleFilterFolders({categoryIds: selectedPath.map(path => path.id)})
    onClose();
  }

  // const handleSelect = (levelIndex: number, categoryId: string) => {
  //   const newPath = selectedPath.slice(0, levelIndex);

  //   const selected = data?.find(c => c.id === categoryId);
  //   if (selected) newPath.push(selected);

  //   setSelectedPath(newPath);
  // };

  const handleSelect = (levelIndex: number, categoryId: string) => {
    const newPath = selectedPath.slice(0, levelIndex);

    const selected = categories.find(c => c.id === categoryId);
    if (selected) newPath.push(selected);

    setSelectedPath(newPath);
  };

  // const handleAddLevel = (categoryId: string) => {
  //   const selected = data?.find(c => c.id === categoryId);
  //   if (selected) {
  //     setSelectedPath(prev => [...prev, selected]);
  //   }
  // };

  const handleAddLevel = (categoryId: string) => {
    const selected = categories.find(c => c.id === categoryId);
    if (selected) {
      setSelectedPath(prev => [...prev, selected]);
    }
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
          <form onSubmit={(e: React.SubmitEvent) => FilterFolders(e)} className="space-y-4">

            {selectedPath.map((level, index) => {
              const parentId = index === 0 ? null : selectedPath[index - 1].id;

              console.log(selectedPath)

              // const options =
              //   index === 0
              //     ? data?.filter(cat => !cat.parent)
              //     : selectedPath[index - 1].children || [];
                
              const options = categories.filter(cat => cat.parentId === parentId);

              return (
                <div key={index} className="flex gap-4">
                  <select
                    key={index}
                    value={level.id}
                    onChange={(e) => handleSelect(index, e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                  >
                    {options?.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => addNewCategory()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    <Plus className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCategory()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    <Minus className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => editCategory()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              );
            })}

            <select onChange={(e) => handleAddLevel(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400">
              <option value="">Select</option>
              {currentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

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

        {categorySelected && (
          <CreateCategoryModal
            parentId={currentParentId}
            onClose={() => setCategorySelected(null)}
            isPending={isCategoryAdding}
          />
        )}

        {categoryToDelete && data && (
          <DeleteCategoryModal
            categoryList={data.filter(category => category.parent?.id === currentParentId)}
            onClose={() => setCategoryToDelete(null)}
            isPending={isCategoryAdding}
          />
        )}

        {categoryToEdit && data && (
          <EditCategoryModal
            categoryList={data.filter(category => category.parent?.id === currentParentId)}
            onClose={() => setCategoryToEdit(null)}
            isPending={isCategoryAdding}
          />
        )}
      </div>
    </div>
  );
}