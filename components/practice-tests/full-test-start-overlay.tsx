"use client";

import React from "react";

interface FullTestStartOverlayProps {
  onStart: () => void;
}

export default function FullTestStartOverlay({ onStart }: FullTestStartOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        TOEIC Listening & Reading Full Test
      </h1>
      <p className="text-gray-600 max-w-xl mb-6">
        Bạn sắp bắt đầu một bài thi đầy đủ gồm cả phần Listening và Reading.
        Bài thi sẽ được thực hiện liên tục và âm thanh sẽ tự động phát. 
        Bạn <strong>không thể dừng, tua hoặc đổi tốc độ của phần nghe</strong> trong quá trình làm bài.
      </p>
      <button
        onClick={onStart}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow"
      >
        Bắt đầu làm bài
      </button>
    </div>
  );
}
