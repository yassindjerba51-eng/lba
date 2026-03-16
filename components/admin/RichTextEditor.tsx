"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, dir = "ltr", placeholder }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  }), []);

  const formats = [
    "header",
    "bold", "italic", "underline", "strike",
    "color", "background",
    "list", "indent",
    "align",
    "blockquote", "code-block",
    "link", "image",
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden rich-text-editor">
      {/* Toggle bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          {isHtmlMode ? "Mode HTML" : "Mode Visuel"}
        </span>
        <button
          type="button"
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            isHtmlMode
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          {isHtmlMode ? "← Visuel" : "HTML </>"}
        </button>
      </div>

      {/* Editor */}
      {isHtmlMode ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          placeholder={placeholder || "Éditez le HTML directement..."}
          className="w-full min-h-[300px] p-4 font-mono text-sm text-slate-700 bg-slate-50 focus:outline-none resize-y border-0"
          spellCheck={false}
        />
      ) : (
        <div dir={dir}>
          <ReactQuill
            theme="snow"
            value={value || ""}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder || "Commencez à écrire..."}
          />
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 250px;
          font-size: 15px;
          border: none !important;
        }
        .rich-text-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc;
        }
        .rich-text-editor .ql-editor {
          min-height: 250px;
          padding: 16px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
