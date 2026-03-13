import { useMutation, useQueryClient } from "@tanstack/react-query";

type FilePayload = {
  fileId: string;
  systemName: string;
  date: string;
  physicalLocation: string;
};

type AddFilePayLoad = {
	file: File;
  name: string;
  date: string;
  physicalLocation: string;
}

export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, fileData }: {
				folderId: string;
				fileData: FilePayload; 
			}) => {
      const res = await fetch(`/api/file/${fileData.fileId}`, {
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
      queryClient.invalidateQueries({ queryKey: ["fileById", variables.fileData.fileId] });
    },
  });
}

export function useAddFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ folderId, fileData }: {
				folderId: string;
				fileData: AddFilePayLoad[]; 
			}) => {
			console.log({ folderId, fileData })

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