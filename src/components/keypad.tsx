"use client";

import React from "react";
import { Backpack as Backspace } from "lucide-react";

type KeypadProps = {
  onDigit: (digit: string) => void;
  onClear: () => void;
};

export default function Keypad({ onDigit, onClear }: KeypadProps) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "clear"];

  const handleKeyClick = (key: string) => {
    if (key === "clear") {
      onClear();
    } else if (key !== "") {
      onDigit(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {digits.map((digit, index) => (
        <button
          key={index}
          onClick={() => handleKeyClick(digit)}
          className={`
            h-16
            text-2xl
            font-medium
            rounded-xl
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            active:scale-95
            ${digit === "clear" 
              ? "bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center gap-2" 
              : digit === ""
              ? "cursor-default"
              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }
          `}
          disabled={digit === ""}
        >
          {digit === "clear" ? (
            <>
              <Backspace className="w-5 h-5" />
              <span className="text-sm">Effacer</span>
            </>
          ) : (
            digit
          )}
        </button>
      ))}
    </div>
  );
}