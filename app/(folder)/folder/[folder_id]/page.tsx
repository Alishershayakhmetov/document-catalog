"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  X,
  CalendarDays,
  Edit,
  LogOut,
  FolderOpen,
  ChevronRight
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useFolderById, useDeleteFolder } from "@/hooks/folder";
import { useUpdateFolder } from "@/hooks/folder";
import { formatDate } from "@/utils/dateUtils";
import { useAddFiles, useUpdateFile, useDeleteFiles } from "@/hooks/file";
import EditFileModal from "@/features/folder/editFile";
import FileCard from "@/features/folder/fileCard";
import FileUploadFields from "@/features/shared/fileUploadFields";
import { FileCardInfo, FileCardInfoState, SelectedFileItem } from "@/shared/types/global";
import { CatalogTreeResponse, useCatalogTree } from "@/hooks/catalog";
import { pluralize } from "@/utils/pluralWord";

const emptyForm: FileCardInfoState = {
  systemName: "",
  date: "",
  physicalLocation: "",
  description: "",
};

export default function FolderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const folderId = params.folder_id as string;
  const highlightFileId = searchParams.get('fileId');
  const router = useRouter();
  const fileRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: folderData, isLoading: isFolderLoading, error } = useFolderById(folderId);
  const { mutate: updateFolder, isPending: isFolderUpdating } = useUpdateFolder();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const { mutate: updateFile, isPending: isFileUpdating } = useUpdateFile();
  const { mutate: addFiles, isPending: isFilesAdding, progress: uploadProgress, cancel: cancelUpload, isPending: isUploadPending } = useAddFiles();
  const { mutate: deleteFiles, isPending: isFilesDeleting } = useDeleteFiles();
  const { mutate: deleteFolder, isPending: isFolderDeleting } = useDeleteFolder();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeleteFolderMode, setIsDeleteFolderMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ isEditFolderModalOpen, setIsEditFolderModalOpen ] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [editForm, setEditForm] = useState<FileCardInfoState>(emptyForm);

  const files: FileCardInfo[] = folderData?.files ?? [];
  const selectedCount = useMemo(() => selectedFileIds.length, [selectedFileIds]);

  useEffect(() => {
    if (!highlightFileId || !files.length) return;

    const el = fileRefs.current[highlightFileId];

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      el.classList.add('highlight');

      setTimeout(() => {
        el.classList.remove('highlight');
      }, 2000);
    }
  }, [highlightFileId, files]);

  const toggleDeleteMode = () => {
    if (!folderData) return;

    if (!isDeleteMode) {
      setIsDeleteMode(true);
      return;
    }

    if (selectedFileIds.length > 0) {
      deleteFiles({ folderId, fileIds: selectedFileIds });
      setSelectedFileIds([]);
    }

    setIsDeleteMode(false);
  };

  const handleDeleteFolder = () => {
    if (!folderData) return;
    if (folderData.files.length !== 0) return;

    deleteFolder(folderId, {
      onSuccess: () => {
        setIsDeleteFolderMode(false);
        router.push("/");
      },
    });
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
    addFiles({folderId, fileData: selectedFiles}, {
      onSuccess: (data) => {
        console.log("uploaded");
        function delay(ms: number) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        delay(500)
        setIsAddModalOpen(false);
        setSelectedFileIds([]);
        setSelectedFiles([]);
      },
      onError: (error) => {
        console.error(error.message);
      },
    })
  };

  const openEditModal = (file: FileCardInfo) => {

    console.log(file)

    setEditingFileId(file.id);
    setEditForm({
      systemName: file.systemName,
      date: file.date,
      physicalLocation: file.physicalLocation,
      description: file.description
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingFileId(null);
    setEditForm(emptyForm);
    setIsEditModalOpen(false);
  };

  const handleEditFile = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!editingFileId) return;

    if (
      !(editForm.systemName && editForm.systemName.trim()) ||
      !editForm.date
    ) {
      return;
    }

    updateFile(
      {
        folderId: folderId,
        fileData: {
          id: editingFileId,
          systemName: editForm.systemName.trim(),
          date: editForm.date,
          physicalLocation: editForm.physicalLocation?.trim(),
          description: editForm.description,
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

  const handleEditFolder = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const date = formData.get("date") as string;

    updateFolder({
      id: folderId,
      name,
      date,
      categoryId: editSelectedCategoryId
    });

    setIsEditFolderModalOpen(false)
  };

  // Edit modal category state
  const [editSelectedPath, setEditSelectedPath] = useState<string[]>([]);
  const { data, isLoading: isCatalogsLoading, isError } = useCatalogTree();
  // Re-use the same useCatalogTree hook data (assuming { data, isLoading, isError } is already declared)
  const flatNodes: CatalogTreeResponse[] = data ?? [];

  // Build dropdown levels for the edit modal
  const editDropdownLevels: { nodes: CatalogTreeResponse[]; label: string }[] = [];

  const rootNodes = flatNodes.filter((n) => n.parent === null);
  if (rootNodes.length > 0) {
    editDropdownLevels.push({ nodes: rootNodes, label: "Категория" });
  }

  for (let i = 0; i < editSelectedPath.length; i++) {
    const parentId = editSelectedPath[i];
    const children = flatNodes.filter((n) => n.parent?.id === parentId);
    if (children.length > 0) {
      editDropdownLevels.push({
        nodes: children,
        label: `Подкатегория (уровень ${i + 1})`,
      });
    } else {
      break;
    }
  }

  const handleEditLevelChange = (levelIndex: number, selectedId: string) => {
    const newPath = editSelectedPath.slice(0, levelIndex);
    if (selectedId) newPath.push(selectedId);
    setEditSelectedPath(newPath);
  };

  // Deepest selected node = the actual category for the edited folder
  const editSelectedCategoryId = editSelectedPath.at(-1) ?? "";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Вернуться на Главную страницу
              </button>

              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl mt-4 mb-4">
                {folderData?.name ?? "Folder"}
              </h1>

              {/* Breadcrumb Path */}
              <nav className="flex items-center flex-wrap gap-2 text-sm ml-1">
                <FolderOpen className="h-4 w-4 text-blue-500 mr-1" />
                {folderData?.categoryPathNames?.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-500 hover:text-gray-900 transition-colors cursor-default">
                      {name}
                    </span>
                    {index < folderData.categoryPathNames.length - 1 && (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                    )}
                  </div>
                ))}
              </nav>

              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700">
                <CalendarDays className="h-4 w-4" />
                {folderData?.date ? formatDate(folderData.date) : "No date"}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  disabled={!folderData || isFolderUpdating}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Добавить Файлы
                </button>

                <button
                  onClick={() => {
                    setEditSelectedPath(folderData?.category.path.split("/") ?? [])
                    setIsEditFolderModalOpen(true)
                  }}
                  disabled={!folderData || isFolderUpdating}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${"bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  <Edit className="h-4 w-4" />
                  Изменить Папку
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
                  {isDeleteMode ? `Выбранные Файлы: (${selectedCount})`: "Удалить Файлы"}
                </button>

                {isDeleteMode && (
                  <button
                    onClick={cancelDeleteMode}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Отмена
                  </button>
                )}

                <button
                  onClick={() => setIsDeleteFolderMode(true)}
                  disabled={!folderData || isFolderUpdating}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${"bg-red-600 text-white hover:bg-red-700"}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить Папку
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Выбранные Файлы</h2>
              <div className="text-sm text-gray-500">
                {pluralize(files.length, ['Файл', 'Файла', 'Файлов'])}
              </div>
            </div>

            {isDeleteMode && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Выберите файлы из списка, а затем снова нажмите кнопку &quot;Удалить&quot;.
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200">
              {isFolderLoading ? (
                <div className="p-10 text-center text-gray-500">Загрузка Папки...</div>
              ) : error || !folderData ? (
                <div className="p-10 text-center text-red-500">Папка не найдена</div>
              ) : files.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      ref={(el) => {
                        fileRefs.current[file.id] = el;
                      }}
                      className={file.id === highlightFileId ? "highlight" : "" }
                    > 
                      <FileCard 
                        selectedFileIds={selectedFileIds} 
                        file={file} 
                        isDeleteMode={isDeleteMode} 
                        toggleFileSelection={toggleFileSelection} 
                        openEditModal={openEditModal} 
                        isFolderUpdating={isFolderUpdating} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <p className="text-lg font-semibold text-gray-900">Нет Файлов</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Добавьте файлы в эту папку, чтобы управлять ими здесь.
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
              <h3 className="text-xl font-semibold text-gray-900">Добавить Файлы</h3>
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
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setSelectedFileIds([]);
                    setSelectedFiles([]);
                    cancelUpload();
                  }}
                  // disabled={!isUploadPending}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isFolderUpdating}
                  className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Добавить Файлы
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Загрузка...</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {/* shimmer effect */}
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                </div>
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

      {isDeleteFolderMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Удалить Папку</h3>
              <button
                onClick={() => setIsDeleteFolderMode(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {folderData?.files.length !== 0 && (
              <h3 className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-semibold text-gray-900">Вы не можете удалить папку, поскольку в нем все еще храняться файлы</h3>
            )}         

            {folderData?.files.length === 0 && (
              <h3 className="text-l font-semibold text-gray-900">Вы уверены, что хотите удалить папку?</h3>
            )}         
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteFolderMode(false)}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={folderData?.files.length !== 0 || isFolderDeleting}
                onClick={handleDeleteFolder}
                className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isFolderDeleting ? "Удаление..." : "Удалить Папку"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditFolderModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setIsEditFolderModalOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white p-6 pr-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Изменить Папку</h3>
              <button
                onClick={() => setIsEditFolderModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mr-3 flex-1 overflow-y-auto pr-3">
              <form onSubmit={handleEditFolder}>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Имя Папки
                    </label>
                    <input
                      name="name"
                      defaultValue={folderData?.name}
                      placeholder="Название папки"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Дата папки
                    </label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={folderData?.date?.split("T")[0]}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                    />
                  </div>

                  {isCatalogsLoading && (
                    <p className="text-sm text-gray-400">Загрузка категорий...</p>
                  )}
                  {isError && (
                    <p className="text-sm text-red-500">Ошибка загрузки категорий</p>
                  )}

                  {!isCatalogsLoading && !isError && editDropdownLevels.map((level, index) => (
                    <div key={index}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {level.label}
                      </label>
                      <select
                        value={editSelectedPath[index] ?? ""}
                        onChange={(e) => handleEditLevelChange(index, e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700"
                      >
                        <option value="">Выберите {level.label}</option>
                        {level.nodes.map((node) => (
                          <option key={node.id} value={node.id}>
                            {node.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditFolderModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isFolderDeleting}
                    className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isFolderDeleting ? "Изменения..." : "Изменить Папку"}
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