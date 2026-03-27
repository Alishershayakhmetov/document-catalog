"use client";

import { useRouter } from "next/navigation";
import { Paperclip, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { FolderResponse } from "@/hooks/folder";
import { formatDate } from "@/utils/dateUtils";
import { useState } from "react";

type PathSegment = {
  id: string;
  name: string | null | undefined;
};

type TreeNode = {
  id: string; // category id
  name: string;
  folders: FolderResponse[];
  children: TreeNode[];
};


/**
 * Builds a category tree from a flat folder list.
 * Each folder has:
 *   folder.category  → { id, name }
 *   folder.path      → PathSegment[]  (ancestor chain, root → leaf)
 *
 * It reconstructs the hierarchy purely from `folder.path` so the UI mirrors
 * the real category tree even without a separate categories endpoint.
 */
function buildTree(folders: FolderResponse[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  const getOrCreate = (id: string, name: string): TreeNode => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, name, folders: [], children: [] });
    }
    return nodeMap.get(id)!;
  };

  for (const folder of folders) {
    const path: PathSegment[] = folder.path ?? [];

    if (path.length === 0) {
      // No category — dump into a virtual uncategorised bucket
      const bucket = getOrCreate("__uncategorized__", "Без категории");
      bucket.folders.push(folder);
      continue;
    }

    // Ensure every node in the path exists
    for (let i = 0; i < path.length; i++) {
      const seg = path[i];
      getOrCreate(seg.id, seg.name ?? seg.id);
    }

    // Wire parent → child relationships
    for (let i = 1; i < path.length; i++) {
      const parent = nodeMap.get(path[i - 1].id)!;
      const child  = nodeMap.get(path[i].id)!;
      if (!parent.children.some((c) => c.id === child.id)) {
        parent.children.push(child);
      }
    }

    // Attach the folder to its leaf node
    const leaf = nodeMap.get(path[path.length - 1].id)!;
    if (!leaf.folders.some((f) => f.id === folder.id)) {
      leaf.folders.push(folder);
    }
  }

  // Root nodes = nodes that are not a child of any other node
  const childIds = new Set<string>();
  for (const node of nodeMap.values()) {
    for (const child of node.children) childIds.add(child.id);
  }

  return [...nodeMap.values()].filter((n) => !childIds.has(n.id));
}

function FolderRow({ folder, depth }: { folder: FolderResponse; depth: number }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
        <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-300" />
        <p className="select-text text-sm text-gray-800">{folder.name}</p>
      </div>

      <div className="md:col-span-2">
        <p className="select-text text-xs text-gray-500">{formatDate(folder.date)}</p>
      </div>

      <div className="md:col-span-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
          <Paperclip className="h-3 w-3" />
          {folder.fileCount} Файл
        </div>
      </div>
    </div>
  );
}


// Category node (recursive)
function CategoryNode({ node, depth = 0, defaultOpen = false }: {
  node: TreeNode;
  depth?: number;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalFolders = countFolders(node);
  const hasContent = node.folders.length > 0 || node.children.length > 0;

  return (
    <div>
      {/* Category header */}
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

        {isOpen
          ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
          : <Folder className="h-4 w-4 shrink-0 text-amber-400" />
        }

        <span className="text-sm font-semibold text-gray-700 flex-1 truncate">
          {node.name}
        </span>

        {totalFolders > 0 && (
          <span className="text-xs text-gray-400 shrink-0">
            {totalFolders} папк{totalFolders === 1 ? "а" : totalFolders < 5 ? "и" : ""}
          </span>
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div>
          {/* Child categories first */}
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} />
          ))}

          {/* Folders in this category */}
          {node.folders.map((folder) => (
            <FolderRow key={folder.id} folder={folder} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Count all folders in a node and its descendants
function countFolders(node: TreeNode): number {
  return node.folders.length + node.children.reduce((sum, c) => sum + countFolders(c), 0);
}

export default function FolderList({ folders }: { folders: FolderResponse[] }) {
  const tree = buildTree(folders);

  if (tree.length === 0) return null;

  return (
    <div className="divide-y divide-gray-100">
      {tree.map((node) => (
        <CategoryNode key={node.id} node={node} depth={0} defaultOpen={tree.length === 1} />
      ))}
    </div>
  );
}
