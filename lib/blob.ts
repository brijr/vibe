import { put, del, list } from "@vercel/blob";

export async function uploadFile(
  file: File | Blob,
  pathname: string,
  options?: { access?: "public" }
) {
  const blob = await put(pathname, file, {
    access: options?.access ?? "public",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    contentType: blob.contentType,
  };
}

export async function deleteFile(url: string) {
  await del(url);
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}
