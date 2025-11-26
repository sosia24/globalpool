// components/SuccessToast.tsx
import React from 'react';

export default function SuccessToast({ message, visible, onClose }: {
  message: string;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
      <span>{message}</span>
      <button className="ml-2 text-sm underline" onClick={onClose}>Close</button>
    </div>
  );
}
