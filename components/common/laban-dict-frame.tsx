"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

declare global {
  interface Window {
    lbDictPluginFrame?: {
      init: (config: any) => void;
    };
  }
}

export default function LabanDictFrame() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Configuration for the Laban Dictionary plugin
    const config = {
      s: "https://dict.laban.vn",
      w: 330,
      h: 370,
      hl: 2,
      th: 3,
    };

    // Load script
    const script = document.createElement("script");
    script.src = "https://stc-laban.zdn.vn/dictionary/js/plugin/lbdictplugin.frame.min.js";
    script.async = true;
    script.onload = () => {
      // Call init function after script loads
      if (window.lbDictPluginFrame) {
        window.lbDictPluginFrame.init(config);
      } else {
        console.warn("lbDictPluginFrame not found.");
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-[9999] hover:bg-blue-700 transition"
      >
        <BookOpen className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-[350px] h-[420px] bg-white border rounded-lg shadow-xl p-2 z-[9999]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Dictionary
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div id="lbdict_plugin_frame" />
        </div>
      )}
    </>
  );
}
