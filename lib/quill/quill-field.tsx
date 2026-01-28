"use client";

import dynamic from "next/dynamic";
import { Controller } from "react-hook-form";
import { useMemo, useRef } from "react";
import { createQuillModules } from "./quillModules";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export function QuillField({
  name,
  control,
  placeholder,
  minHeight = 150,
}: {
  name: string;
  control: any;
  placeholder?: string;
  minHeight?: number;
}) {
  const quillRef = useRef<any>(null);

  const modules = useMemo(() => createQuillModules(quillRef), []);

  if (!modules) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (

        <ReactQuill
        // @ts-expect-error ignoring
          ref={quillRef}
          theme="snow"
          value={field.value || ""}
          onChange={field.onChange}
          placeholder={placeholder}
          modules={modules}
          className={`min-h-[${minHeight}px]`}
        />
      )}
    />
  );
}
