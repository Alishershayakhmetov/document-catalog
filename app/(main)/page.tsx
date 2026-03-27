"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useFolders, useCreateFolder, useSearch } from "@/hooks/folder";
import FolderList from "@/features/main/render_folder_list";
import CreateFolderModal from "@/features/main/createFolderModal";
import FilterFolderModal from "@/features/main/filterFolderModal";
import { useDebounce } from "@/hooks/debounce";
import { SelectedFileItem } from "@/shared/types/global";
import SearchResultList from "@/features/main/render_search_list";

const debounce_time = 300;

export default function FoldersPage() {
  const [folderFilters, setFolderFilters] = useState<{
    categoryIds: string[]
  }>({
    categoryIds: []
  });

  const [ searchInput, setSearchInput ] = useState("");
  const debouncedSearch = useDebounce(searchInput, debounce_time);
  
  const queryParams = useMemo(() => ({
    ...folderFilters,
    search: "",
  }), [folderFilters]);

  const isParamEmpty = Object.values(queryParams).every(
    (v) => !v || (Array.isArray(v) ? v.length === 0 : v === "")
  );
  
  const hasSearch = debouncedSearch.trim().length >= 2;
  const { data: folders = [], isLoading: isFoldersLoading, error: foldersError } = useFolders(queryParams);
  const { data: searchResults = [], isLoading: isSearchLoading, error: searchError } = useSearch(debouncedSearch.trim());

  // const isLoading = isFoldersLoading || (hasSearch && isSearchLoading);
  // const isTyping = searchInput !== debouncedSearch;

  const isLoading = hasSearch ? isSearchLoading : isFoldersLoading;
  const error = hasSearch ? searchError : foldersError;
  const isTyping = searchInput !== debouncedSearch;
  const isEmpty = hasSearch ? searchResults.length === 0 : folders.length === 0;

  // merge Folders with filter applied and search query response
  const filteredFolders = useMemo(() => {
    if (!hasSearch) return folders;
    const matchedFolderIds = new Set(searchResults.map((r) => r.folder_id));
    return folders.filter((folder) => matchedFolderIds.has(folder.id));
  }, [hasSearch, folders, searchResults]);
  

  const createFolderMutation = useCreateFolder();

  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const openModal = () => setIsAddFolderModalOpen(true);

  const handleCreateFolder = (data: {
    folderName: string;
    folderDate: string;
    files: SelectedFileItem[];
    categoryIds: string[];
  }) => {
    createFolderMutation.mutate(data);
  };

  const handleFilterFolders = (filters: {
    categoryIds: string[];
  }) => {
    setFolderFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          
          {/* ── Toolbar ── */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск Папок..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 text-gray-700"
                />
              </div>

              <div className="flex w-full items-center gap-3 sm:w-auto">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex-none"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Фильтр
                </button>

                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex-none"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Сортировка
                </button>
              </div>
            </div>

            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              Новая папка
            </button>
          </div>

          {/* ── Table ── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            {/* Header row — only visible on md+ 
            // table header — update columns conditionally */}
            <div className="hidden grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 md:grid">
              {hasSearch ? (
                <>
                  <div className="col-span-3">Файл</div>
                  <div className="col-span-3">Описания</div>
                  <div className="col-span-3">Папка</div>
                  <div className="col-span-1">Дата</div>
                  <div className="col-span-1">Размер</div>
                  <div className="col-span-1">Тип</div>
                </>
              ) : (
                <>
                  <div className="col-span-8">Имя Папки</div>
                  <div className="col-span-2">Дата</div>
                  <div className="col-span-2">Файлы</div>
                </>
              )}
            </div>

            {isLoading && !isTyping ? (
              <div className="p-10 text-center text-gray-500">Загрузка...</div>
            ) : error ? (
              <div className="p-10 text-center text-red-500">Ошибка загрузки</div>
            ) : !isEmpty ? (
              hasSearch
                ? <SearchResultList results={searchResults} />
                : <FolderList folders={folders} />
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {hasSearch ? "Ничего не найдено" : `Пока нет папок ${!isParamEmpty ? "с данными параметрами" : ""}`}
                </p>
                {!hasSearch && isParamEmpty && (
                  <div>
                    <p className="mt-2 text-sm text-gray-500">Создайте свою первую папку</p>
                    <button onClick={openModal} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90">
                      <Plus className="h-5 w-5" />
                      Создать Папку
                    </button>
                  </div>
                )}
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