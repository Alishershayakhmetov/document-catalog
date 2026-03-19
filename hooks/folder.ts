import { FileCardInfo } from "@/shared/types/global";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type FolderData = {
  id: string;
  name: string;
  date: string;
  files: FileCardInfo[]
}

export type UseFoldersParams = {
  mallId: string | null;
  catalogId: string | null;
  subcatalogId: string | null;
  documentationId: string | null;
  search: string
};

type CreateFolderDTO = {
  folderName: string;
  folderDate: string;
  shoppingMall: string | null;
  catalog: string | null;
  subcatalog: string | null;
  documentation: string | null;
  files: {
    file: File;
    physicalLocation: string;
  }[];
};

type FolderFilter = {
  mallId: string | null;
  catalogId: string | null;
  subcatalogId: string | null;
  documentationId: string | null;
};

async function fetchFolders(filters: UseFoldersParams) {
  const query = new URLSearchParams();

  if (filters.mallId) query.set("mallId", filters.mallId);
  if (filters.catalogId) query.set("catalogId", filters.catalogId);
  if (filters.subcatalogId) query.set("subcatalogId", filters.subcatalogId);
  if (filters.documentationId) query.set("documentationId", filters.documentationId);
  if (filters.search) query.set("search", filters.search)

  const response = await fetch(`/api/folder?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch folders");
  }

  const data = await response.json();

  if (!data) {
    console.error("Failed to fetch folders: empty or invalid response");
    return []
  }
  return data.folders;
}

export const useFolders = (params: UseFoldersParams) => {
  return useQuery({
    queryKey: ["folders", params],
    queryFn: () => fetchFolders(params),
    enabled: !params.search || params.search.length >= 2, // optional optimization
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

const createFolder = async (data: CreateFolderDTO) => {

  const formData = new FormData();

  formData.append("folderName", data.folderName);
  formData.append("folderDate", data.folderDate);
  formData.append("shoppingMallId", data.shoppingMall ?? "");
  formData.append("documentationId", data.documentation ?? "");
  formData.append("catalogId", data.catalog ?? "");
  formData.append("subcatalogId", data.subcatalog ?? "");

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

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The actual backend call
    mutationFn: async (updatedFields: {id: string, name: string, date: string}) => {
      const res = await fetch(`/api/folder/${updatedFields.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },

    // 2. The "Instant UI" logic
    onMutate: async (updatedFields) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['folderById', updatedFields.id] });

      // Snapshot the previous value
      const previousFolder = queryClient.getQueryData<FolderData>(['folderById', updatedFields.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['folderById', updatedFields.id], (old: FolderData | undefined) => {
        return old ? { ...old, ...updatedFields } : old;
      });

      // Return a context object with the snapshotted value
      return { previousFolder };
    },

    // 3. Rollback if things go wrong
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['folderById', newTodo.id], context?.previousFolder);
    },

    // 4. Final sync (refetch to ensure we are in sync with server)
    onSettled: (any, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folderById', variables.id] });
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

async function filterFolders(filters: FolderFilter) {
  const response = await fetch("/api/folder/filter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || "Failed to filter folders");
  }

  return response.json();
}

export function useFilterFolders() {
  return useMutation({
    mutationFn: filterFolders,
  });
}