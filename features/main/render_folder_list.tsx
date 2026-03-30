"use client";

import { useRouter } from "next/navigation";
import { Folder, ChevronRight, LayoutGrid } from "lucide-react";
import { FolderResponse } from "@/hooks/folder";
import { CatalogTreeResponse, useCatalogTree } from "@/hooks/catalog";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";

type TreeNode = {
  id: string;
  name: string;
  folders: FolderResponse[];
  children: TreeNode[];
};

/**
 * Builds a TreeNode tree from the flat CatalogItem list returned by
 * useCatalogTree(). Uses parentId to wire up relationships, then
 * attaches FolderResponse items by matching folder.category?.id.
 * All categories are included — even empty ones.
 */
function buildCatalogTree(
  items: CatalogTreeResponse[],
  foldersByCategory: Map<string, FolderResponse[]>,
): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  // First pass: create every node
  for (const item of items) {
    nodeMap.set(item.id, {
      id: item.id,
      name: item.name,
      folders: foldersByCategory.get(item.id) ?? [],
      children: [],
    });
  }

  // Second pass: wire parent → child
  const childIds = new Set<string>();
  for (const item of items) {
    if (item.parent?.id && nodeMap.has(item.parent?.id)) {
      const parent = nodeMap.get(item.parent?.id)!;
      const child  = nodeMap.get(item.id)!;
      if (!parent.children.some((c) => c.id === child.id)) {
        parent.children.push(child);
        childIds.add(child.id);
      }
    }
  }

  // Root nodes = not a child of anything
  return [...nodeMap.values()].filter((n) => !childIds.has(n.id));
}

/**
 * Fallback: builds a tree purely from folder.path (ancestor chain) when the
 * catalog hasn't loaded yet or errored out.
 */
function buildTreeFromFolders(folders: FolderResponse[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  const getOrCreate = (id: string, name: string): TreeNode => {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, name, folders: [], children: [] });
    return nodeMap.get(id)!;
  };

  for (const folder of folders) {
    const path = folder.path ?? [];

    if (path.length === 0) {
      getOrCreate("__uncategorized__", "Без категории").folders.push(folder);
      continue;
    }

    for (const seg of path) getOrCreate(seg.id, seg.name ?? seg.id);

    for (let i = 1; i < path.length; i++) {
      const parent = nodeMap.get(path[i - 1].id)!;
      const child  = nodeMap.get(path[i].id)!;
      if (!parent.children.some((c) => c.id === child.id)) parent.children.push(child);
    }

    const leaf = nodeMap.get(path[path.length - 1].id)!;
    if (!leaf.folders.some((f) => f.id === folder.id)) leaf.folders.push(folder);
  }

  const childIds = new Set<string>();
  for (const node of nodeMap.values()) {
    for (const child of node.children) childIds.add(child.id);
  }

  return [...nodeMap.values()].filter((n) => !childIds.has(n.id));
}

// ─── Count helpers ────────────────────────────────────────────────────────────

function countFolders(node: TreeNode): number {
  return node.folders.length + node.children.reduce((sum, c) => sum + countFolders(c), 0);
}

// ─── FolderRow ────────────────────────────────────────────────────────────────

function FolderRow({ folder, depth }: { folder: FolderResponse; depth: number }) {
  const router = useRouter();

  const handleClick = () => {
    if (window.getSelection()?.toString()) return;
    router.push(`/folder/${folder.id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{ paddingLeft: `${depth * 24 + 16}px` }}
      className="group cursor-pointer grid grid-cols-1 gap-3 pr-5 py-3 transition hover:bg-gray-50 md:grid-cols-12 md:items-center border-t border-gray-100 first:border-t-0"
    >
      <div className="md:col-span-8 flex items-center gap-2">
        <Folder className="h-3.5 w-3.5 shrink-0 text-gray-300" />
        <p className="select-text text-sm text-gray-800">{folder.name}</p>
      </div>

      <div className="md:col-span-2">
        <p className="select-text text-xs text-gray-500">{formatDate(folder.date)}</p>
      </div>

      <div className="md:col-span-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
          <Folder className="h-3 w-3" />
          {folder.fileCount} Файл
        </div>
      </div>
    </div>
  );
}

// ─── CategoryNode (recursive) ─────────────────────────────────────────────────

function CategoryNode({
  node,
  depth = 0,
  defaultOpen = false,
}: {
  node: TreeNode;
  depth?: number;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalFolders = countFolders(node);
  const hasContent = node.folders.length > 0 || node.children.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
        className="w-full flex items-center gap-2.5 pr-4 py-2.5 text-left transition hover:bg-gray-50 group"
        disabled={!hasContent}
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          } ${!hasContent ? "opacity-0" : ""}`}
        />

        <LayoutGrid className="h-4 w-4 shrink-0 text-amber-400" />

        <span className="text-sm font-semibold text-gray-700 flex-1 truncate">
          {node.name}
        </span>

        {totalFolders > 0 && (
          <span className="text-xs text-gray-400 shrink-0">
            {totalFolders} папк{totalFolders === 1 ? "а" : totalFolders < 5 ? "и" : ""}
          </span>
        )}
      </button>

      {isOpen && (
        <div>
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} />
          ))}
          {node.folders.map((folder) => (
            <FolderRow key={folder.id} folder={folder} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FolderList (root export) ─────────────────────────────────────────────────

export default function FolderList({ folders }: { folders: FolderResponse[] }) {
  const { data: catalogData, isLoading: isCatalogsLoading, isError } = useCatalogTree();

  // Index folders by category id for O(1) lookup during tree build
  const foldersByCategory = new Map<string, FolderResponse[]>();
  for (const folder of folders) {
    const catId = folder.path[folder.path.length - 1].id ?? "__uncategorized__";
    if (!foldersByCategory.has(catId)) foldersByCategory.set(catId, []);
    foldersByCategory.get(catId)!.push(folder);
  }

  // Use catalog tree when available (shows all categories, including empty ones);
  // fall back to folder-derived tree while loading or on error.
  const tree: TreeNode[] =
    isCatalogsLoading || isError || !catalogData
      ? buildTreeFromFolders(folders)
      : buildCatalogTree(catalogData, foldersByCategory);

  if (tree.length === 0) return null;

  return (
    <div className="divide-y divide-gray-100">
      {tree.map((node) => (
        <CategoryNode key={node.id} node={node} depth={0} defaultOpen={tree.length === 1} />
      ))}
    </div>
  );
}
