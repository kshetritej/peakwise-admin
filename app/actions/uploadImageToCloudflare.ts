export const uploadImageToCloudflare = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  // Use local upload endpoint from now on
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image upload failed");

  // local endpoint returns { url }
  const raw = data.url || data.displayUrl;
  if (!raw) return raw;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  // If the returned URL points to the API uploads path, convert to frontend proxied path
  if (apiBase && raw.startsWith(apiBase)) {
    return raw.replace(new RegExp(`^${apiBase}`), "");
  }
  return raw;
};

export const uploadMultipleImagesToLocal = async (files: File[]) => {
  const fd = new FormData();
  files.forEach((f) => fd.append("images", f));

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local/multiple`, {
    method: "POST",
    body: fd,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image upload failed");

  // expect { result: [{ url, filename, path }] }
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  return (data.result || [])
    .map((r: any) => {
      const raw = r.url;
      if (apiBase && raw && raw.startsWith(apiBase)) return raw.replace(new RegExp(`^${apiBase}`), "");
      return raw;
    })
    .filter(Boolean);
};
