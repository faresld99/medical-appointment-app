"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    getUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    type Notification,
} from "@/lib/actions/notifications"
import { formatDistanceToNow } from "date-fns"
import { enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = useCallback(async () => {
        const notifs = await getUnreadNotifications()
        setNotifications(notifs)
        setUnreadCount(notifs.filter((n) => !n.is_read).length)
    }, [])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    useEffect(() => {
        const eventSource = new EventSource("/api/notifications/stream")

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "notification") {
                const newNotification = data.data as Notification

                setNotifications((prev) => {
                    if (prev.some((n) => n.id === newNotification.id)) {
                        return prev
                    }
                    return [newNotification, ...prev]
                })

                setUnreadCount((prev) => prev + 1)

                toast(newNotification.title, {
                    description: newNotification.message,
                })
            }
        }

        eventSource.onerror = () => {
            eventSource.close()
            setTimeout(() => {}, 5000)
        }

        return () => {
            eventSource.close()
        }
    }, [])

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId)
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead()
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "booking_request":
                return "📅"
            case "booking_confirmed":
                return "✅"
            case "booking_cancelled":
                return "❌"
            default:
                return "🔔"
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            variant="destructive"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No notifications
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                                        !notification.is_read && "bg-primary/5",
                                    )}
                                >
                                    <span className="text-lg">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 space-y-1">
                                        <p
                                            className={cn(
                                                "text-sm",
                                                !notification.is_read && "font-medium",
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(
                                                new Date(notification.created_at),
                                                {
                                                    addSuffix: true,
                                                    locale: enUS,
                                                },
                                            )}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            onClick={() =>
                                                handleMarkAsRead(notification.id)
                                            }
                                        >
                                            <Check className="h-3 w-3" />
                                            <span className="sr-only">
                                                Mark as read
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
