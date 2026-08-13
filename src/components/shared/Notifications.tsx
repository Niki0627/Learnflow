"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell as NotificationsIcon,
  BellOff as NotificationsNoneIcon,
  SquareCheck as DoneAllIcon,
  Trash2 as DeleteOutlineIcon,
  Circle as CircleIcon,
} from "lucide-react";
import { useAuth } from "@context/AuthContext";
import { api } from "@lib/api-client";
import type { AppNotification } from "@lib/types";

export default function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<AppNotification[]>("notifications/");
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch {
      // Ignore transient failures; polling will retry.
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("refreshNotifications", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshNotifications", handleRefresh);
    };
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await api.post(`notifications/${id}/mark-read/`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const deleteNotification = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await api.delete(`notifications/${id}/delete/`);
      const deletedNote = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deletedNote && !deletedNote.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Ignore
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-2xl text-white transition hover:bg-white/10"
      >
        <NotificationsIcon size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-black leading-4 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-violet-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.32)]"
            style={{ maxHeight: 500 }}
          >
            <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3">
              <span className="text-base font-bold text-violet-950">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:bg-violet-50"
                >
                  <DoneAllIcon size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center px-8 py-8 text-center text-violet-500">
                  <NotificationsNoneIcon size={48} className="mb-2 opacity-50" />
                  <span className="text-sm">No notifications yet</span>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="group border-b border-violet-100 transition-colors last:border-b-0"
                      style={{
                        backgroundColor: notification.is_read ? "transparent" : "rgba(91,79,233,0.08)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(91,79,233,0.14)")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = notification.is_read
                          ? "transparent"
                          : "rgba(91,79,233,0.08)")
                      }
                    >
                      <div className="flex items-start gap-2 px-3 py-2">
                        <div className="mt-1 flex w-3 shrink-0 justify-center">
                          {!notification.is_read ? (
                            <CircleIcon size={12} className="text-primary" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm text-violet-950"
                            style={{ fontWeight: notification.is_read ? 400 : 600 }}
                          >
                            {notification.message}
                          </p>
                          <div className="mt-0.5 flex items-center justify-between">
                            <span className="text-xs text-violet-500">
                              {new Date(notification.created_at).toLocaleDateString()}{" "}
                              {new Date(notification.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {!notification.is_read && (
                              <button
                                type="button"
                                onClick={(e) => markAsRead(notification.id, e)}
                                className="px-1 py-0.5 text-[0.7rem] font-bold text-primary hover:bg-violet-50"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="Delete notification"
                          onClick={(e) => deleteNotification(notification.id, e)}
                          className="shrink-0 rounded p-1 text-violet-400 opacity-0 transition-opacity hover:bg-violet-100 hover:text-violet-900 group-hover:opacity-100"
                        >
                          <DeleteOutlineIcon size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
