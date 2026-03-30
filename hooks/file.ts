import { FileCardInfo, SelectedFileItem } from "@/shared/types/global";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

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
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const mutation = useMutation({
    mutationFn: ({ folderId, fileData }: {
      folderId: string;
      fileData: SelectedFileItem[];
    }) => {
      const formData = new FormData();
      fileData.forEach((item) => formData.append("files", item.file));
      formData.append(
        "filesMetadata",
        JSON.stringify(
          fileData.map((item) => ({
            physicalLocation: item.physicalLocation,
            systemName: item.name,
            date: item.date,
            description: item.description,
          }))
        )
      );

      setProgress(0);

      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          xhrRef.current = null;
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => { xhrRef.current = null; reject(new Error("Network error")); };
        xhr.onabort = () => { xhrRef.current = null; reject(new Error("Upload aborted")); };

        xhr.open("POST", `/api/folder/${folderId}`);
        xhr.send(formData);
      });
    },
    onSuccess: (_data, variables) => {
      setProgress(0);
      queryClient.invalidateQueries({ queryKey: ["folderById", variables.folderId] });
    },
  });

  const cancel = () => xhrRef.current?.abort();

  return { ...mutation, progress, cancel };
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