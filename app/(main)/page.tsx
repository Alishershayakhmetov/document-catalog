"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useFolders, useCreateFolder } from "@/hooks/folder";
import FolderList from "@/features/main/render_folder_list";
import CreateFolderModal from "@/features/main/createFolderModal";
import FilterFolderModal from "@/features/main/filterFolderModal";

type SelectedFileItem = {
  file: File;
  physicalLocation: string;
};

type FilterFolderProps = { 
  mallId: string | null, 
  categoryId: string | null, 
  subcategoryId: string | null, 
  documentationId: string | null 
}

export default function FoldersPage() {
  const [folderFilters, setFolderFilters] = useState<{
    mallId: string | null;
    catalogId: string | null;
    subcatalogId: string | null;
    documentationId: string | null;
  }>({
    mallId: null,
    catalogId: null,
    subcatalogId: null,
    documentationId: null,
  });

  const { data: folders = [], isLoading, error } = useFolders(folderFilters);
  const createFolderMutation = useCreateFolder();

  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const openModal = () => setIsAddFolderModalOpen(true);

  const handleCreateFolder = (data: {
    folderName: string;
    folderDate: string;
    shoppingMall: string;
    documentation: string;
    catalogue: string;
    subCatalogue: string;
    files: SelectedFileItem[];
  }) => {
    createFolderMutation.mutate(data);
  };

  const handleFilterFolders = (filters: {
    mallId: string | null;
    catalogId: string | null;
    subcatalogId: string | null;
    documentationId: string | null;
  }) => {
    setFolderFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search folders..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400"
                  disabled
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </button>
            </div>

            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              New Folder
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="hidden grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 md:grid">
              <div className="col-span-8">Folder Name</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Files</div>
            </div>

            {isLoading ? (
              <div className="p-10 text-center text-gray-500">
                Loading folders...
              </div>
            ) : error ? (
              <div className="p-10 text-center text-red-500">
                Failed to load folders
              </div>
            ) : folders.length > 0 ? (
              <FolderList folders={folders} />
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-lg font-semibold text-gray-900">No folders yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Create your first folder to start building the catalog.
                </p>
                <button
                  onClick={openModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Plus className="h-5 w-5" />
                  Create Folder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddFolderModalOpen && 
      <CreateFolderModal
        onClose={() => setIsAddFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
        isPending={createFolderMutation.isPending}
      />}      

      {isFilterOpen && 
      <FilterFolderModal
        onClose={() => setIsFilterOpen(false)}
        handleFilterFolders={handleFilterFolders}
        isPending={isLoading}
      />}
      
    </div>
  );
}