import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type Folder = {
  id: string;
  name: string;
  date: string;
  _count: {
    files: number
  }
};

export type FolderData = {
  id: string;
  name: string;
  date: string;
  files: {
    id: string,
    date: string,
    systemName: string,
    physicalLocation: string
  }[]
}

const fetchFolders = async (): Promise<Folder[]> => {
  const res = await fetch("/api/folder");

  if (!res.ok) {
    throw new Error("Failed to fetch folders");
  }

  return res.json();
};

export const useFolders = () => {
  return useQuery({
    queryKey: ["folders"],
    queryFn: fetchFolders,
    staleTime:1000 * 60 * 5, // 5 min cache
  });
};

const fetchFolderById = async (id: string): Promise<FolderData> => {
  const res = await fetch("/api/folder/" + id);

  if (!res.ok) {
    throw new Error("Failed to fetch folders");
  }

  return res.json();
};

export const useFolderById = (id: string) => {
  return useQuery({
    queryKey: ["folderById", id],
    queryFn: () => fetchFolderById(id),
    staleTime:1000 * 60 * 5, // 5 min cache
  });
};

type UploadFile = {
  file: File;
  physicalLocation: string;
};

type CreateFolderDTO = {
  folderName: string;
  folderDate: string;
  shoppingMall: string;
  documentation: string;
  catalogue: string;
  subCatalogue: string;
  files: UploadFile[];
};

const createFolder = async (data: CreateFolderDTO) => {

  const formData = new FormData();

  formData.append("folderName", data.folderName);
  formData.append("folderDate", data.folderDate);
  formData.append("shoppingMall", data.shoppingMall);
  formData.append("documentation", data.documentation);
  formData.append("catalogue", data.catalogue);
  formData.append("subCatalogue", data.subCatalogue);

  // files metadata
  const metadata = data.files.map((f,index)=>({
    index,
    physicalLocation:f.physicalLocation
  }));

  formData.append(
    "filesMetadata",
    JSON.stringify(metadata)
  );

  // files
  data.files.forEach((f)=>{
    formData.append("files", f.file);
  });

  const res = await fetch("/api/folder",{
    method:"POST",
    body:formData
  });

  if(!res.ok){
    throw new Error("Failed");
  }

  return res.json();
};

export const useCreateFolder = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:createFolder,

    onSuccess:()=>{
      queryClient.invalidateQueries({
        queryKey:["folders"]
      });
    }
  });
};

export const useUpdateFolder = (folderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The actual backend call
    mutationFn: async (updatedFields: Partial<FolderData>) => {
      const res = await fetch(`/api/folder/${folderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },

    // 2. The "Instant UI" logic
    onMutate: async (updatedFields) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['folderById', folderId] });

      // Snapshot the previous value
      const previousFolder = queryClient.getQueryData<FolderData>(['folderById', folderId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['folderById', folderId], (old: FolderData | undefined) => {
        return old ? { ...old, ...updatedFields } : old;
      });

      // Return a context object with the snapshotted value
      return { previousFolder };
    },

    // 3. Rollback if things go wrong
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['folderById', folderId], context?.previousFolder);
    },

    // 4. Final sync (refetch to ensure we are in sync with server)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['folderById', folderId] });
    },
  });
};

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderId: string) => {
      const res = await fetch(`/api/folder/${folderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete folder");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}