import { FileCardInfo, SelectedFileItem } from "@/shared/types/global";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, fileData }: {
				folderId: string;
				fileData: FileCardInfo; 
			}) => {
      const res = await fetch(`/api/file/${fileData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileData),
      });

      if (!res.ok) {
        throw new Error("Failed to update file");
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["folderById", variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ["fileById", variables.fileData.id] });
    },
  });
}

export function useAddFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, fileData }: {
				folderId: string;
				fileData: SelectedFileItem[]; 
			}) => {
			const formData = new FormData();
			fileData.forEach((item) => {
				formData.append("files", item.file);
			});
			formData.append(
				"filesMetadata",
				JSON.stringify(
					fileData.map((item) => ({
						physicalLocation: item.physicalLocation,
						systemName: item.name,
						date: item.date,
            description: item.description
					}))
				)
			);

      const res = await fetch(`/api/folder/${folderId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update file");
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["folderById", variables.folderId] });
      // queryClient.invalidateQueries({ queryKey: ["fileById", variables.fileData.fileId] });
    },
  });
}

export function useDeleteFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, fileIds }: {
				folderId: string;
				fileIds: string[]; 
			}) => {
      const res = await fetch(`/api/file`, {
        method: "DELETE",
        body: JSON.stringify({folderId, fileIds}),
      });

      if (!res.ok) {
        throw new Error("Failed to update file");
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["folderById", variables.folderId] });
      variables.fileIds.map(fileId => {
        queryClient.invalidateQueries({ queryKey: ["fileById", fileId] });
      })
    },
  });
}