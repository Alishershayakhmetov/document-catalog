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
import { useAddFiles, useUpdateFile } from "@/hooks/file";
import EditFileModal from "@/features/folder/editFile";
import FileCard from "@/features/folder/fileCard";
import FileUploadFields from "@/features/shared/fileUploadFields";

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

type SelectedFileItem = {
  file: File;
  physicalLocation: string;
  name: string;
  date: string;
};

export default function FolderDetailsPage() {
  const params = useParams();
  const folderId = params.folder_id as string;

  const { data: folderData, isLoading, error } = useFolderById(folderId);
  const { mutate: updateFolder, isPending: isFolderUpdating } = useUpdateFolder(folderId);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const { mutate: updateFile, isPending: isFileUpdating } = useUpdateFile();
  const { mutate: addFiles, isPending: isFilesAdding } = useAddFiles();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [addForm, setAddForm] = useState<FileFormState>(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [editForm, setEditForm] = useState<FileFormState>(emptyForm);

  const files: FolderFile[] = folderData?.files ?? [];
  const selectedCount = useMemo(() => selectedFileIds.length, [selectedFileIds]);

  // const submitUpdatedFiles = (updatedFiles: FolderFile[]) => {
  //   if (!folderData) return;

  //   updateFolder({
  //     ...folderData,
  //     files: updatedFiles,
  //   });
  // };

  // const submitUpdatedFile = (updatedFile: FileData) => {
  //   if (!folderData) return;

  //   updateFolder({
  //     ...folderData,
  //     files: updatedFiles,
  //   });
  // };

  // const toggleDeleteMode = () => {
  //   if (!folderData) return;

  //   if (!isDeleteMode) {
  //     setIsDeleteMode(true);
  //     return;
  //   }

  //   if (selectedFileIds.length > 0) {
  //     const updatedFiles = files.filter((file) => !selectedFileIds.includes(file.id));
  //     submitUpdatedFiles(updatedFiles);
  //     setSelectedFileIds([]);
  //   }

  //   setIsDeleteMode(false);
  // };

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

  const handleAddFile = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!folderData) return;

    selectedFiles.map((file) => {
      if (
        !file.name.trim() ||
        !file.date ||
        !file.physicalLocation.trim()
      ) {
        return;
      }

      file = {...file, name: file.name.trim(), physicalLocation: file.physicalLocation.trim()}
    })

    // submitUpdatedFiles([newFile, ...files]);

    console.log({folderId, fileData: selectedFiles})
    addFiles({folderId, fileData: selectedFiles})
    setIsAddModalOpen(false);
    setAddForm(emptyForm);
  };

  const openEditModal = (file: FolderFile) => {

    console.log(file)

    setEditingFileId(file.id);
    setEditForm({
      systemName: file.systemName,
      date: file.date,
      physicalLocation: file.physicalLocation,
    });
    setIsEditModalOpen(true);
  };

  // const handleEditFile = (e: React.SubmitEvent) => {
  //   e.preventDefault();
  //   if (!folderData || !editingFileId) return;

  //   const updatedFiles = files.map((file) =>
  //     file.id === editingFileId
  //       ? {
  //           ...file,
  //           systemName: editForm.systemName.trim(),
  //           date: editForm.date,
  //           physicalLocation: editForm.physicalLocation.trim(),
  //         }
  //       : file
  //   );

  //   submitUpdatedFiles(updatedFiles);
  //   setEditingFileId(null);
  //   setEditForm(emptyForm);
  //   setIsEditModalOpen(false);
  // };

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

  const handleEditFile = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!editingFileId) return;

    if (
      !editForm.systemName.trim() ||
      !editForm.date ||
      !editForm.physicalLocation.trim()
    ) {
      return;
    }

    console.log("editingFileId:", editingFileId);
    console.log("editForm:", editForm);

    updateFile(
      {
        folderId: folderId,
        fileData: {
          fileId: editingFileId,
          systemName: editForm.systemName.trim(),
          date: editForm.date,
          physicalLocation: editForm.physicalLocation.trim(),
        }
      },
      {
        onSuccess: () => {
          setEditingFileId(null);
          setEditForm(emptyForm);
          setIsEditModalOpen(false);
        },
      }
    );
  };

  const toggleDeleteMode = () => {
    console.log("not implemented")
  }

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
                  {files.map((file) => (
                    <FileCard key={file.id} selectedFileIds={selectedFileIds} file={file} isDeleteMode={isDeleteMode} toggleFileSelection={toggleFileSelection} openEditModal={openEditModal} handleShare={handleShare} isFolderUpdating={isFolderUpdating} />
                  ))}
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
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Add File</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-4 max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto">

              <FileUploadFields selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />

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
        // <EditFileModal editingFileId={editingFileId} closeEditModal={closeEditModal} handleEditFile={handleEditFile} isFolderUpdating={isFolderUpdating} />
      
        <EditFileModal
          closeEditModal={closeEditModal}
          handleEditFile={handleEditFile}
          isFolderUpdating={isFolderUpdating}
          editForm={editForm}
          setEditForm={setEditForm}
        />
      
      )}
    </div>
  );
}