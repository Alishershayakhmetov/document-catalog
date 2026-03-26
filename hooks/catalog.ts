import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type MallOption = {
  id: string;
  name: string;
};
export type CatalogOption = {
  id: string;
  name: string;
  mallId: string;
};
export type SubCatalogOption = {
  id: string;
  name: string;
  catalogId: string;
};
export type DocumentationOption = {
  id: string;
  name: string;
  subcatalogId: string;
};
export type CatalogTreeResponse =  {
  children: {
    id: string;
    name: string;
    path: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string | null;
  }[];
  id: string;
  name: string;
  path: string;
  parent: {
    id: string;
    name: string;
    path: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string | null;
  } | null;
}

async function fetchCatalogTree(): Promise<CatalogTreeResponse[]> {
  const response = await fetch("/api/catalog");
  if (!response.ok) {
    throw new Error("Failed to fetch catalog tree");
  }
  return response.json();
}

export function useCatalogTree() {
  return useQuery<CatalogTreeResponse[]>({
    queryKey: ["catalog-tree"],
    queryFn: fetchCatalogTree,
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentCategoryId, createCategoryName } : {
				parentCategoryId: string | null;
				createCategoryName: string; 
			}) => {
      const res = await fetch(`/api/catalog`, {
        method: "POST",
        body: JSON.stringify({ parentCategoryId, createCategoryName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create new Category");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-tree"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId }: {
				categoryId: string;
			}) => {
        console.log(categoryId)

      const res = await fetch(`/api/catalog`, {
        method: "DELETE",
        body: JSON.stringify({ categoryId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete new Category");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-tree"] });
    },
  });
}

export function useEditCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, newName }: {
				categoryId: string;
        newName: string
			}) => {
      const res = await fetch(`/api/catalog`, {
        method: "PATCH",
        body: JSON.stringify({ categoryId, newName }),
      });

      if (!res.ok) {
        throw new Error("Failed to edit new Category");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-tree"] });
    },
  });
}