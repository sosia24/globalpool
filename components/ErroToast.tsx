"use client";
import { useEffect, useState } from "react";

type Props = {
  message: string;
  visible: boolean;
  onClose: () => void;
};

export default function ErrorToast({ message, visible, onClose }: Props) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose(); // Notifica o pai que o erro foi fechado
      }, 4000); // Duração do toast

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg animate-fade-in">
        <strong>Error:</strong> {message}
      </div>
    </div>
  );
}
