"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  date: Date;
  read: boolean;
};

export default function NotificationsMenu() {
  // Tous les hooks sont appelés inconditionnellement
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      message: "Nouveau message de la direction",
      date: new Date(),
      read: false,
    },
    {
      id: "n2",
      message: "Heures supplémentaires validées",
      date: new Date(Date.now() - 3600 * 1000),
      read: false,
    },
    {
      id: "n3",
      message: "Pointage manquant pour Alice",
      date: new Date(Date.now() - 86400 * 1000),
      read: true,
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function toggleMenu() {
    setIsOpen((prev) => !prev);
  }

  function markAllAsRead() {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* On affiche le menu uniquement une fois le composant monté */}
      {mounted && (
        <div
          className={`
            absolute right-0 mt-2 w-80 
            bg-white dark:bg-gray-900 
            border border-gray-200 dark:border-gray-800 
            rounded-xl shadow-2xl z-50
            transform origin-top-right transition-all duration-200
            ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
          `}
        >
          <div className="p-2 max-h-80 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`
                    p-3 rounded-lg 
                    hover:bg-gray-50 dark:hover:bg-gray-800 
                    transition-colors cursor-pointer
                    ${notif.read ? "opacity-70" : ""}
                  `}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === notif.id ? { ...n, read: true } : n
                      )
                    );
                  }}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {notif.date.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
