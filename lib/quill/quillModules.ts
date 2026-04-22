import { table } from "console";
import { quillImageHandler } from "./quillImageHandle";

export const createQuillModules = (quillRef: any) => ({
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
      ["clear"],
      ["table"]
    ],
    Clipboard: {
      matchVisuals: false,
    },
    table: true,
    handlers: {
      image: () => {
        if (!quillRef?.current) return;
        quillImageHandler(quillRef.current.getEditor());
      },
      clear: () => {
        if (!quillRef?.current) return;
        const editor = quillRef.current.getEditor();
        editor.setText('');          // clear all content
        editor.setSelection(0, 0);   // reset cursor
      },
    },
  },
});