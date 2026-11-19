
"use client";

import { useEffect, useRef, useState } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  function openMenu() {
    const rect = containerRef.current?.getBoundingClientRect();

    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setOpenUp(spaceBelow < 260 && spaceAbove > spaceBelow);
    }

    setActiveIndex(
      Math.max(0, options.findIndex((option) => option.value === value))
    );
    setOpen(true);
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectOption(option: CustomSelectOption) {
    onChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!open) {
        openMenu();
      } else if (activeIndex >= 0 && options[activeIndex]) {
        selectOption(options[activeIndex]);
      }

      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        openMenu();
        return;
      }

      setActiveIndex((previous) => {
        if (options.length === 0) return -1;

        if (event.key === "ArrowDown") {
          return (previous + 1) % options.length;
        }

        return previous <= 0 ? options.length - 1 : previous - 1;
      });
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openMenu();
          }
        }}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-[#111a35] px-3 py-2.5 text-left text-sm text-white outline-none transition hover:border-accent/60 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected ? "text-white" : "text-muted"}>
          {selected?.label ?? placeholder}
        </span>

        <svg
          className={`size-4 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute left-0 z-[200] max-h-60 w-full overflow-y-auto rounded-xl border border-[#2a3a70] bg-[#111a35] p-1.5 shadow-2xl shadow-black/40 ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-[#1b2b52] text-white"
                      : "text-slate-200 hover:bg-[#1b2b52] hover:text-white"
                }`}
              >
                <span>{option.label}</span>

                {isSelected && (
                  <span aria-hidden="true">✓</span>
                )}
              </button>
            );
          })}

          {options.length === 0 && (
            <p className="px-3 py-3 text-center text-sm text-slate-400">
              No options available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
