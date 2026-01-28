// lib/quillImageHandler.ts
export function quillImageHandler(quill: any) {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      //   console.log("res.", res)
      //   console.log("Res JSON:", await res.json())

      const url = (await res.json()).url;

      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url);
      quill.setSelection(range.index + 1);
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };
}
