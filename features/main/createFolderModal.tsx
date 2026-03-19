"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import FileUploadFields from "@/features/shared/fileUploadFields";
import { Option, CatalogOption, SubcatalogOption, DocumentationOption} from "./types";
import { useCatalogTree } from "@/hooks/catalog";

type SelectedFileItem = {
  file: File;
  physicalLocation: string;
  name: string;
  date: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (data: {
    folderName: string;
    folderDate: string;
    shoppingMall: string | null;
    documentation: string | null;
    catalog: string | null;
    subCatalog: string | null;
    files: SelectedFileItem[];
  }) => void;
  isPending?: boolean;
};

export default function CreateFolderModal({
  onClose,
  onSubmit,
  isPending = false,
}: Props) {
  const [folderName, setFolderName] = useState("");
  const [folderDate, setFolderDate] = useState("");

  // const [shoppingMall, setShoppingMall] = useState("");
  // const [documentation, setDocumentation] = useState("");
  // const [catalogue, setCatalogue] = useState("");
  // const [subCatalogue, setSubCatalogue] = useState("");
  
  const [selectedMall, setSelectedMall] = useState<Option | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogOption | null>(null);
  const [selectedSubcatalog, setSelectedSubcatalog] = useState<SubcatalogOption | null>(null);
  const [selectedDocumentation, setSelectedDocumentation] = useState<DocumentationOption | null>(null);

  const { data, isLoading, isError } = useCatalogTree();

  const allMalls = data?.mall ?? [];
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

  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);

  const resetForm = () => {
    setFolderName("");
    setFolderDate("");
    setSelectedFiles([]);
    setSelectedMall(null);
    setSelectedCatalog(null);
    setSelectedSubcatalog(null);
    setSelectedDocumentation(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    onSubmit({
      folderName,
      folderDate,
      shoppingMall: selectedMall?.id || null,
      catalog: selectedCatalog?.id || null,
      subCatalog: selectedSubcatalog?.id || null,
      documentation: selectedDocumentation?.id || null,
      files: selectedFiles,
    });

    handleClose();
  };

  const handleMallChange = (mallId: string) => {
    const mall = allMalls.find((item) => item.id === mallId) ?? null;
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
            Создать Новую Папку
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Имя Папки
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter Folder name"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Дата папки
              </label>
              <input
                type="date"
                value={folderDate}
                onChange={(e) => setFolderDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ТРЦ
              </label>
              <select
                value={selectedMall?.id ?? ""}
                onChange={(e) => handleMallChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
              >
                <option value="">Выберите ТРЦ</option>
                {allMalls.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Каталог
              </label>
              <select
                value={selectedCatalog?.id ?? ""}
                onChange={(e) => handleCatalogChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
              >
                <option value="">Выберите Каталог</option>
                {catalogs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Суб-Каталог
              </label>

              <select
                value={selectedSubcatalog?.id ?? ""}
                onChange={(e) => handleSubcatalogChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
              >
                <option value="">Выберите Суб-Каталог</option>
                {subcatalogs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Документация
              </label>
              <select
                value={selectedDocumentation?.id ?? ""}
                onChange={(e) => handleDocumentationChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
              >
                <option value="">Выберите Документация</option>
                {documentations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

            </div>

            <FileUploadFields
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
            />

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
                {isPending ? "Создание..." : "Создать"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}