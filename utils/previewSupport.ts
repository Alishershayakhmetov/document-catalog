/**
 * previewSupport.ts
 *
 * Decides whether a file can be previewed in-browser based on MIME type,
 * extension, and optional browser capabilities.
 *
 * Usage:
 *   const result = canPreviewFile("application/pdf", "report.pdf");
 *   if (result.supported) {
 *     console.log("Preview allowed");
 *   } else {
 *     console.log(result.reason);
 *   }
 */

export type BrowserName =
  | "chrome"
  | "firefox"
  | "safari"
  | "edge"
  | "opera"
  | "unknown";

export interface PreviewDecision {
  supported: boolean;
  reason?: string;
  strategy?: "iframe" | "img" | "video" | "audio" | "text" | "download";
}

export interface BrowserInfo {
  name: BrowserName;
  version?: number;
}

const DIRECT_PREVIEW_MIME_TYPES: Record<
  string,
  PreviewDecision["strategy"]
> = {
  // Images
  "image/png": "img",
  "image/jpeg": "img",
  "image/jpg": "img",
  "image/gif": "img",
  "image/webp": "img",
  "image/svg+xml": "img",
  "image/bmp": "img",

  // Text
  "text/plain": "text",
  "text/html": "iframe",
  "text/css": "text",
  "application/json": "text",
  "text/csv": "text",

  // PDF
  "application/pdf": "iframe",

  // Audio
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/ogg": "audio",
  "audio/wav": "audio",

  // Video
  "video/mp4": "video",
  "video/webm": "video",
  "video/ogg": "video",
};

const OFFICE_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/msword", // doc
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.ms-powerpoint", // ppt
]);

export function detectBrowser(): BrowserInfo {
  if (typeof navigator === "undefined") {
    return { name: "unknown" };
  }

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes("edg")) return { name: "edge" };
  if (ua.includes("opr") || ua.includes("opera")) return { name: "opera" };
  if (ua.includes("chrome")) return { name: "chrome" };
  if (ua.includes("firefox")) return { name: "firefox" };
  if (ua.includes("safari")) return { name: "safari" };

  return { name: "unknown" };
}

export function canPreviewFile(
  mimeType: string,
  fileName?: string | null,
  browser: BrowserInfo = detectBrowser()
): PreviewDecision {
  const normalized = mimeType.toLowerCase().trim();

  // Standard supported types
  if (DIRECT_PREVIEW_MIME_TYPES[normalized]) {
    const strategy = DIRECT_PREVIEW_MIME_TYPES[normalized];

    // if (
    //   browser.name === "safari" &&
    //   (normalized === "video/webm" || normalized === "audio/ogg")
    // ) {
    //   return {
    //     supported: false,
    //     reason: "This format is not reliably supported in Safari.",
    //     strategy: "download",
    //   };
    // }

    return {
      supported: true,
      strategy,
    };
  }

  if (OFFICE_MIME_TYPES.has(normalized)) {
    return {
      supported: false,
      reason:
        "Office files are not natively previewable in most browsers. Convert to PDF or use server-side preview.",
      strategy: "download",
    };
  }

  /**
   * Plain fallback by extension if MIME missing/wrong
   */
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext) {
      if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
        return { supported: true, strategy: "img" };
      }

      if (ext === "pdf") {
        return { supported: true, strategy: "iframe" };
      }

      if (["txt", "log", "json", "csv"].includes(ext)) {
        return { supported: true, strategy: "text" };
      }

      if (["mp4", "webm"].includes(ext)) {
        return { supported: true, strategy: "video" };
      }

      if (["mp3", "wav", "ogg"].includes(ext)) {
        return { supported: true, strategy: "audio" };
      }
    }
  }

  // Unknown type
  return {
    supported: false,
    reason: "This file type cannot be previewed in the current browser.",
    strategy: "download",
  };
}

/**
 * Optional helper for UI logic
 */
export function shouldForceDownload(
  mimeType: string,
  fileName?: string
): boolean {
  return !canPreviewFile(mimeType, fileName).supported;
}