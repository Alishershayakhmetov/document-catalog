"use client";

import { X } from "lucide-react";
import { useState } from "react";
import FileUploadFields from "@/features/shared/fileUploadFields";

type SelectedFileItem = {
  file: File;
  physicalLocation: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    folderName: string;
    folderDate: string;
    shoppingMall: string;
    documentation: string;
    catalogue: string;
    subCatalogue: string;
    files: SelectedFileItem[];
  }) => void;
  isPending?: boolean;
};

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: Props) {
  const [folderName, setFolderName] = useState("");
  const [folderDate, setFolderDate] = useState("");
  const [shoppingMall, setShoppingMall] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [catalogue, setCatalogue] = useState("");
  const [subCatalogue, setSubCatalogue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);

  const resetForm = () => {
    setFolderName("");
    setFolderDate("");
    setShoppingMall("");
    setDocumentation("");
    setCatalogue("");
    setSubCatalogue("");
    setSelectedFiles([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      folderName,
      folderDate,
      shoppingMall,
      documentation,
      catalogue,
      subCatalogue,
      files: selectedFiles,
    });

    handleClose();
  };

  if (!isOpen) return null;

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
            Create New Folder
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
                Folder Name
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
                Folder Date
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
                Shopping Mall
              </label>
              <input
                type="text"
                value={shoppingMall}
                onChange={(e) => setShoppingMall(e.target.value)}
                placeholder="Enter Shopping Mall"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Documentation
              </label>
              <input
                type="text"
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                placeholder="Enter Documentation"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Catalogue
              </label>
              <input
                type="text"
                value={catalogue}
                onChange={(e) => setCatalogue(e.target.value)}
                placeholder="Enter Catalogue"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subcatalogue
              </label>
              <input
                type="text"
                value={subCatalogue}
                onChange={(e) => setSubCatalogue(e.target.value)}
                placeholder="Enter Subcatalogue"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400"
                required
              />
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