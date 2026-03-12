"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, ArrowUpDown, Paperclip, X } from "lucide-react";
import { useFolders } from "@/hooks/folder";
import { formatDate } from "@/utils/dateUtils";
import { useCreateFolder } from "@/hooks/folder";
import Link from "next/link";
import FolderList from "@/features/main/render_folder_list";

export default function FoldersPage() {
  const { data: folders = [], isLoading, error } = useFolders();
  const createFolderMutation = useCreateFolder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDate, setFolderDate] = useState("");
  const [shoppingMall, setShoppingMall] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [catalogue, setCatalogue] = useState("");
  const [subCatalogue, setSubCatalogue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    {
      file: File;
      physicalLocation: string;
    }[]
  >([]);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFolderName("");
    setFolderDate("");
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles(
      files.map(file=>({
        file,
        physicalLocation:""
      }))
    );
  };

  const handleCreateFolder = async (e:React.FormEvent)=>{

    e.preventDefault();

    createFolderMutation.mutate({

      folderName,
      folderDate,
      shoppingMall,
      documentation,
      catalogue,
      subCatalogue,

      files:selectedFiles

    });

    closeModal();
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
                disabled
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                disabled
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => closeModal()}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-xl flex flex-col p-6 pr-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Create New Folder</h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-3 mr-3">
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter Folder name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400 text-gray-900 placeholder:text-gray-400 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Upload Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Selected files:</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {selectedFiles.map((item, index) => (
                        <div key={`${item.file.name}-${index}`}>
                          <li className="truncate">
                            {item.file.name}
                          </li>
                          <input
                            type="text"
                            placeholder="Physical location"
                            value={item.physicalLocation}

                            onChange={(e)=>{

                              const copy=[...selectedFiles];

                              copy[index].physicalLocation=
                                e.target.value;

                              setSelectedFiles(copy);

                            }}

                            className="border p-2 w-full rounded"
                          />
                        </div>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}