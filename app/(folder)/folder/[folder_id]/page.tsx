"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Share2,
  X,
  Check,
  FileText,
  CalendarDays,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useFolderById } from "@/hooks/folder";
import { useUpdateFolder } from "@/hooks/folder";
import { formatDate } from "@/utils/dateUtils";

type FolderFile = {
  id: string;
  systemName: string;
  date: string;
  physicalLocation: string;
};

type FileFormState = {
  systemName: string;
  date: string;
  physicalLocation: string;
};

const emptyForm: FileFormState = {
  systemName: "",
  date: "",
  physicalLocation: "",
};

export default function FolderDetailsPage() {
  const params = useParams();
  const folderId = params.folder_id as string;

  const { data: folderData, isLoading, error } = useFolderById(folderId);
  const { mutate: updateFolder, isPending: isFolderUpdating } = useUpdateFolder(folderId);
  // const { mutate: updateFile, isPending: isFileUpdating } = useUpdateFile();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  const [addForm, setAddForm] = useState<FileFormState>(emptyForm);
  const [editForm, setEditForm] = useState<FileFormState>(emptyForm);

  const files: FolderFile[] = folderData?.files ?? [];
  const selectedCount = useMemo(() => selectedFileIds.length, [selectedFileIds]);

  const submitUpdatedFiles = (updatedFiles: FolderFile[]) => {
    if (!folderData) return;

    updateFolder({
      ...folderData,
      files: updatedFiles,
    });
  };

  const toggleDeleteMode = () => {
    if (!folderData) return;

    if (!isDeleteMode) {
      setIsDeleteMode(true);
      return;
    }

    if (selectedFileIds.length > 0) {
      const updatedFiles = files.filter((file) => !selectedFileIds.includes(file.id));
      submitUpdatedFiles(updatedFiles);
      setSelectedFileIds([]);
    }

    setIsDeleteMode(false);
  };

  const cancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedFileIds([]);
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    setAddForm(emptyForm);
    setIsAddModalOpen(true);
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderData) return;

    if (
      !addForm.systemName.trim() ||
      !addForm.date ||
      !addForm.physicalLocation.trim()
    ) {
      return;
    }

    const newFile: FolderFile = {
      id: crypto.randomUUID(),
      systemName: addForm.systemName.trim(),
      date: addForm.date,
      physicalLocation: addForm.physicalLocation.trim(),
    };

    submitUpdatedFiles([newFile, ...files]);
    setIsAddModalOpen(false);
    setAddForm(emptyForm);
  };

  const openEditModal = (file: FolderFile) => {
    setEditingFileId(file.id);
    setEditForm({
      systemName: file.systemName,
      date: file.date,
      physicalLocation: file.physicalLocation,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderData || !editingFileId) return;

    const updatedFiles = files.map((file) =>
      file.id === editingFileId
        ? {
            ...file,
            systemName: editForm.systemName.trim(),
            date: editForm.date,
            physicalLocation: editForm.physicalLocation.trim(),
          }
        : file
    );

    submitUpdatedFiles(updatedFiles);
    setEditingFileId(null);
    setEditForm(emptyForm);
    setIsEditModalOpen(false);
  };

  const closeEditModal = () => {
    setEditingFileId(null);
    setEditForm(emptyForm);
    setIsEditModalOpen(false);
  };

  const handleShare = async (file: FolderFile) => {
    try {
      const url = `${window.location.origin}/folder/${folderId}/${file.id}`;
      await navigator.clipboard.writeText(url);
      alert("File URL copied to clipboard");
    } catch {
      alert("Unable to share file URL");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                {folderData?.name ?? "Folder"}
              </h1>

              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700">
                <CalendarDays className="h-4 w-4" />
                {folderData?.date ? formatDate(folderData.date) : "No date"}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={openAddModal}
                  disabled={!folderData || isFolderUpdating}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add File
                </button>

                <button
                  onClick={toggleDeleteMode}
                  disabled={!folderData || isFolderUpdating}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isDeleteMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleteMode
                    ? selectedCount > 0
                      ? `Delete Selected (${selectedCount})`
                      : "Finish Delete"
                    : "Delete Files"}
                </button>

                {isDeleteMode && (
                  <button
                    onClick={cancelDeleteMode}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Attached files</h2>
              <div className="text-sm text-gray-500">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </div>
            </div>

            {isDeleteMode && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Select files from the list, then click the delete button again.
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200">
              {isLoading ? (
                <div className="p-10 text-center text-gray-500">Loading folder...</div>
              ) : error || !folderData ? (
                <div className="p-10 text-center text-red-500">Folder not found</div>
              ) : files.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {files.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);

                    return (
                      <div
                        key={file.id}
                        className={`grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[2.2fr_1fr_2.4fr_auto] md:items-center ${
                          isDeleteMode && isSelected ? "bg-red-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-3">
                            {isDeleteMode && (
                              <button
                                onClick={() => toggleFileSelection(file.id)}
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                  isSelected
                                    ? "border-red-600 bg-red-600 text-white"
                                    : "border-gray-300 bg-white text-transparent"
                                }`}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <div className="shrink-0 rounded-xl bg-gray-100 p-2">
                              <FileText className="h-5 w-5 text-gray-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {file.systemName}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm text-gray-600">{formatDate(file.date)}</div>
                        </div>

                        <div className="min-w-0">
                          <div className="break-words text-sm text-gray-600">
                            {file.physicalLocation}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2 md:justify-end">
                            <button
                              onClick={() => openEditModal(file)}
                              disabled={isDeleteMode || isFolderUpdating}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleShare(file)}
                              disabled={isDeleteMode}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <p className="text-lg font-semibold text-gray-900">No files attached</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Add files to this folder to manage them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Add file</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  System name
                </label>
                <input
                  type="text"
                  value={addForm.systemName}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, systemName: e.target.value }))
                  }
                  placeholder="Enter system name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  File date
                </label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Physical location
                </label>
                <input
                  type="text"
                  value={addForm.physicalLocation}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      physicalLocation: e.target.value,
                    }))
                  }
                  placeholder="Cabinet 2, shelf 4"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFolderUpdating}
                  className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingFileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Edit file</h3>
              <button
                onClick={closeEditModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditFile} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  System name
                </label>
                <input
                  type="text"
                  value={editForm.systemName}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, systemName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  File date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Physical location
                </label>
                <input
                  type="text"
                  value={editForm.physicalLocation}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      physicalLocation: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFolderUpdating}
                  className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}