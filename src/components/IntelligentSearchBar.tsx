"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, User, PlusCircle, MoreHorizontal, Command } from "lucide-react";

// Types
type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
};

type ActionItem = {
  id: string;
  label: string;
  link: string;
  icon?: React.ReactNode;
};

type MenuItem = 
  | { type: "action"; data: ActionItem }
  | { type: "employee"; data: Employee };

// Actions
const actionItems: ActionItem[] = [
  {
    id: "new-employee",
    label: "Créer un nouvel employé",
    link: "/dashboard/employees/new",
    icon: <PlusCircle size={20} className="text-emerald-500" />,
  },
];

export default function IntelligentSearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [actionResults, setActionResults] = useState<ActionItem[]>(actionItems);
  const [employeeResults, setEmployeeResults] = useState<Employee[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch employees
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    }
    fetchEmployees();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsFocused(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsFocused(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter results
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const filteredActions = q
      ? actionItems.filter((action) => action.label.toLowerCase().includes(q))
      : actionItems;
    const filteredEmployees = q
      ? employees.filter((emp) =>
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q)
        )
      : [];

    setActionResults(filteredActions);
    setEmployeeResults(filteredEmployees);
    setHighlightIndex(-1);
  }, [query, employees]);

  // Combine results
  useEffect(() => {
    const combined: MenuItem[] = [
      ...actionResults.map(act => ({ type: "action" as const, data: act })),
      ...employeeResults.map(emp => ({ type: "employee" as const, data: emp }))
    ];
    setMenuItems(combined);
  }, [actionResults, employeeResults]);

  // Handle selection
  const handleSelectEmployee = (employee: Employee) => {
    router.push(`/dashboard/employees/${employee.id}`);
    setQuery("");
    setIsFocused(false);
  };

  const handleSelectAction = (action: ActionItem) => {
    router.push(action.link);
    setQuery("");
    setIsFocused(false);
  };

  // Arrow navigation
  useEffect(() => {
    const handleArrows = (e: KeyboardEvent) => {
      if (!isFocused) return;

      if (["ArrowUp", "ArrowDown", "Enter"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowDown") {
        setHighlightIndex((prev) => {
          const next = prev + 1;
          return next >= menuItems.length ? menuItems.length - 1 : next;
        });
      } else if (e.key === "ArrowUp") {
        setHighlightIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? 0 : next;
        });
      } else if (e.key === "Enter" && highlightIndex >= 0 && highlightIndex < menuItems.length) {
        const item = menuItems[highlightIndex];
        if (item.type === "action") {
          handleSelectAction(item.data);
        } else {
          handleSelectEmployee(item.data);
        }
      }
    };

    window.addEventListener("keydown", handleArrows);
    return () => window.removeEventListener("keydown", handleArrows);
  }, [isFocused, menuItems, highlightIndex]);

  return (
    <>
      {isFocused && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-200"
          onClick={() => {
            setIsFocused(false);
            setQuery("");
          }}
        />
      )}

      <div
        className={`
          transition-all duration-300 ease-in-out z-50
          ${isFocused ? "fixed inset-0 flex items-start justify-center p-4" : ""}
        `}
        style={{ pointerEvents: isFocused ? "none" : "auto" }}
      >
        <div
          className={`
            bg-white dark:bg-gray-900 shadow-2xl rounded-xl transition-all duration-300 relative
            border border-gray-200 dark:border-gray-800
            ${isFocused 
              ? "mt-20 w-[42rem] max-h-[80vh] overflow-hidden" 
              : "w-[20rem] hover:w-[22rem] transition-all duration-300"
            }
          `}
          style={{ pointerEvents: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
            <Search className="text-gray-400 dark:text-gray-500" size={18} />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un employé ou une action... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="
                border-none ring-0 focus:ring-0 shadow-none
                bg-transparent placeholder:text-gray-400
                dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-200
                text-sm
              "
            />
            {!isFocused && (
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>

          {isFocused && (
            <div className="relative">
              <div className="p-2 max-h-[60vh] overflow-y-auto space-y-0.5">
                {menuItems.length > 0 ? (
                  menuItems.map((item, idx) => {
                    const isHighlighted = idx === highlightIndex;
                    const isAction = item.type === "action";
                    
                    return (
                      <div
                        key={`${item.type}-${idx}`}
                        onClick={() =>
                          isAction
                            ? handleSelectAction(item.data as ActionItem)
                            : handleSelectEmployee(item.data as Employee)
                        }
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                          transition-colors duration-150 group relative
                          ${isHighlighted 
                            ? "bg-gray-100 dark:bg-gray-800" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }
                        `}
                      >
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-lg
                          ${isAction 
                            ? "bg-emerald-50 dark:bg-emerald-900/20" 
                            : "bg-blue-50 dark:bg-blue-900/20"
                          }
                        `}>
                          {isAction ? (
                            (item.data as ActionItem).icon || (
                              <MoreHorizontal size={18} className="text-emerald-500" />
                            )
                          ) : (
                            <User size={18} className="text-blue-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                            {isAction
                              ? (item.data as ActionItem).label
                              : `${(item.data as Employee).firstName} ${(item.data as Employee).lastName}`
                            }
                          </p>
                          {!isAction && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Employé
                            </p>
                          )}
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Command size={14} className="text-gray-400" />
                        </div>
                      </div>
                    );
                  })
                ) : query ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucun résultat pour &quot;{query}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Commencez à taper pour rechercher...
                    </p>
                  </div>
                )}
              </div>

              {menuItems.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span>↑</span>
                      <span>↓</span>
                      <span className="ml-1">pour naviguer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>↵</span>
                      <span>pour sélectionner</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>esc</span>
                      <span>pour fermer</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}