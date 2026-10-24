/**
 * Utilities for extracting Google Drive file IDs, generating image display URLs,
 * and handling PDF or external document links.
 */

export function extractDriveFileId(url: string | undefined): string | null {
  if (!url) return null;

  // Match open?id=xxx
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  // Match /d/xxx/
  const fileDMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) return fileDMatch[1];

  // Match uc?id=xxx
  const ucMatch = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];

  return null;
}

export function isPdfUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
}

export function getDisplayImageUrl(url: string | undefined, useProxy = true): string {
  if (!url) return '';
  
  const fileId = extractDriveFileId(url);
  if (fileId) {
    if (useProxy) {
      return `/api/proxy-image?id=${fileId}`;
    }
    return `https://lh3.googleusercontent.com/d/${fileId}=w800`;
  }

  // If it's a regular direct image URL or already proxied
  if (url.startsWith('http') && useProxy && !url.includes('/api/proxy-image')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  return url;
}

export function getDriveDownloadUrl(url: string | undefined): string {
  if (!url) return '#';
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

export function getDriveViewUrl(url: string | undefined): string {
  if (!url) return '#';
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url;
}

export function getDriveEmbedPreviewUrl(url: string | undefined): string | null {
  if (!url) return null;
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return null;
}
