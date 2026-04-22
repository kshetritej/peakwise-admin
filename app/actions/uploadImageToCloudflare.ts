import { compressIfNeeded } from "@/lib/imageCompressor";

export const uploadImageToCloudflare = async (file: File) => {
  const compressed = await compressIfNeeded(file);

  const formData = new FormData();
  formData.append("file", compressed);

  // Use local upload endpoint from now on
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image upload failed");

  // local endpoint returns { url }
  const raw = data.url || data.displayUrl;
  if (!raw) return raw;
  const apiBase = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  // If the returned URL points to the API uploads path, convert to frontend proxied path
  if (apiBase && raw.startsWith(apiBase)) {
    return raw.replace(new RegExp(`^${apiBase}`), "");
  }
  return raw;
};

export const uploadMultipleImagesToLocal = async (
  files: File[],
  folder?: string,
) => {
  const compressed = await Promise.all(files.map((f) => compressIfNeeded(f)));
  const url = folder
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local/multiple?dir=${folder}`
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local/multiple`;
  const fd = new FormData();
  compressed.forEach((f) => fd.append("images", f));
  // const fd = new FormData();
  // files.forEach((f) => fd.append("images", f));

  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image upload failed");

  // expect { result: [{ url, filename, path }] }
  const apiBase = (process.env.API_BASE_URL || "").replace(/\/$/, "");
  return (data.result || [])
    .map((r: any) => {
      const raw = r.url;
      if (apiBase && raw && raw.startsWith(apiBase))
        return raw.replace(new RegExp(`^${apiBase}`), "");
      return raw;
    })
    .filter(Boolean);
};
