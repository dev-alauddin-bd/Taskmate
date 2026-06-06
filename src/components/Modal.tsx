"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, title, children }: any) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--surface)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-semibold text-lg">{title}</h3>

          <button onClick={onClose}>✕</button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}