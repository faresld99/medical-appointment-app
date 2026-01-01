"use client"

import { useState } from "react"
import { format, addDays, setHours, setMinutes } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Clock, Loader2, CalendarDays, Settings2, Trash2 } from "lucide-react"
import { addAvailability, removeAvailability, addWeeklyAvailability } from "@/lib/actions/availability"
import { toast } from "sonner"
import type { AvailabilitySlot } from "@/lib/db"
import { cn } from "@/lib/utils"

type AvailabilityManagerProps = {
    practitionerId: string
    availability: AvailabilitySlot[]
}

const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

const DAYS_OF_WEEK = [
    { key: "monday", label: "Monday", dayIndex: 1 },
    { key: "tuesday", label: "Tuesday", dayIndex: 2 },
    { key: "wednesday", label: "Wednesday", dayIndex: 3 },
    { key: "thursday", label: "Thursday", dayIndex: 4 },
    { key: "friday", label: "Friday", dayIndex: 5 },
    { key: "saturday", label: "Saturday", dayIndex: 6 },
    { key: "sunday", label: "Sunday", dayIndex: 0 },
]

type DaySchedule = {
    enabled: boolean
    startTime: string
    endTime: string
}

type WeeklySchedule = Record<string, DaySchedule>

const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
    monday: { enabled: true, startTime: "08:00", endTime: "16:00" },
    tuesday: { enabled: true, startTime: "08:00", endTime: "16:00" },
    wednesday: { enabled: true, startTime: "08:00", endTime: "16:00" },
    thursday: { enabled: true, startTime: "08:00", endTime: "16:00" },
    friday: { enabled: true, startTime: "08:00", endTime: "16:00" },
    saturday: { enabled: true, startTime: "08:00", endTime: "12:00" },
    sunday: { enabled: true, startTime: "08:00", endTime: "12:00" },
}

export function AvailabilityManager({ availability }: AvailabilityManagerProps) {
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(DEFAULT_WEEKLY_SCHEDULE)
    const [weeksToGenerate, setWeeksToGenerate] = useState<string>("4")
    const [isGenerating, setIsGenerating] = useState(false)

    // Single day editing
    const [editDate, setEditDate] = useState<Date | undefined>(undefined)
    const [editStartTime, setEditStartTime] = useState<string>("")
    const [editEndTime, setEditEndTime] = useState<string>("")
    const [isAddingSingle, setIsAddingSingle] = useState(false)
    const [removing, setRemoving] = useState<string | null>(null)

    const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
        setWeeklySchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], ...updates },
        }))
    }

    const applyWeekdaySchedule = (startTime: string, endTime: string) => {
        setWeeklySchedule((prev) => ({
            ...prev,
            monday: { ...prev.monday, startTime, endTime },
            tuesday: { ...prev.tuesday, startTime, endTime },
            wednesday: { ...prev.wednesday, startTime, endTime },
            thursday: { ...prev.thursday, startTime, endTime },
            friday: { ...prev.friday, startTime, endTime },
        }))
    }

    const applyWeekendSchedule = (startTime: string, endTime: string) => {
        setWeeklySchedule((prev) => ({
            ...prev,
            saturday: { ...prev.saturday, startTime, endTime },
            sunday: { ...prev.sunday, startTime, endTime },
        }))
    }

    const handleGenerateWeekly = async () => {
        setIsGenerating(true)

        const result = await addWeeklyAvailability({
            schedule: weeklySchedule,
            weeksAhead: Number.parseInt(weeksToGenerate),
        })

        setIsGenerating(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Availability generated for ${weeksToGenerate} weeks`)
        }
    }

    const handleAddSingleDay = async () => {
        if (!editDate || !editStartTime || !editEndTime) return

        setIsAddingSingle(true)

        const [startHour, startMin] = editStartTime.split(":").map(Number)
        const [endHour, endMin] = editEndTime.split(":").map(Number)

        const startDateTime = setMinutes(setHours(editDate, startHour), startMin)
        const endDateTime = setMinutes(setHours(editDate, endHour), endMin)

        const formData = new FormData()
        formData.set("startTime", startDateTime.toISOString())
        formData.set("endTime", endDateTime.toISOString())

        const result = await addAvailability({}, formData)

        setIsAddingSingle(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Availability added")
            setEditDate(undefined)
            setEditStartTime("")
            setEditEndTime("")
        }
    }

    const handleRemove = async (slotId: string) => {
        setRemoving(slotId)
        const result = await removeAvailability(slotId)
        setRemoving(null)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Availability removed")
        }
    }

    // Group availability by date
    const groupedAvailability = availability.reduce(
        (acc, slot) => {
            const dateKey = format(new Date(slot.start_time), "yyyy-MM-dd")
            if (!acc[dateKey]) {
                acc[dateKey] = []
            }
            acc[dateKey].push(slot)
            return acc
        },
        {} as Record<string, AvailabilitySlot[]>,
    )

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Manage Availability
                </CardTitle>
                <CardDescription>Set your weekly schedule or edit specific days</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-hidden">
                <Tabs defaultValue="weekly" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="weekly" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Weekly Schedule
                        </TabsTrigger>
                        <TabsTrigger value="single" className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4" />
                            Specific Day
                        </TabsTrigger>
                    </TabsList>

                    {/* Weekly Schedule Tab */}
                    <TabsContent value="weekly" className="space-y-6">
                        {/* Quick Apply Section */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-6 overflow-hidden">
                            <h4 className="font-medium text-sm">Quick Apply</h4>

                            <div className="grid gap-6 sm:grid-cols-2 min-w-0">
                                {/* Weekdays */}
                                <div className="space-y-4 min-w-0">
                                    <Label className="text-xs text-muted-foreground">
                                        Monday – Friday
                                    </Label>

                                    <div className="space-y-2">
                                        <Select
                                            value={weeklySchedule.monday.startTime}
                                            onValueChange={(v) =>
                                                applyWeekdaySchedule(v, weeklySchedule.monday.endTime)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Start time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={weeklySchedule.monday.endTime}
                                            onValueChange={(v) =>
                                                applyWeekdaySchedule(weeklySchedule.monday.startTime, v)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="End time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Weekend */}
                                <div className="space-y-4 min-w-0">
                                    <Label className="text-xs text-muted-foreground">
                                        Saturday – Sunday
                                    </Label>

                                    <div className="space-y-2">
                                        <Select
                                            value={weeklySchedule.saturday.startTime}
                                            onValueChange={(v) =>
                                                applyWeekendSchedule(v, weeklySchedule.saturday.endTime)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Start time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={weeklySchedule.saturday.endTime}
                                            onValueChange={(v) =>
                                                applyWeekendSchedule(weeklySchedule.saturday.startTime, v)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="End time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Individual Days */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Per-Day Configuration</h4>
                            {DAYS_OF_WEEK.map((day) => (
                                <div
                                    key={day.key}
                                    className={cn(
                                        "flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 rounded-lg border p-3 transition-colors overflow-hidden",
                                        weeklySchedule[day.key].enabled ? "border-border bg-background" : "border-border/50 bg-muted/30",
                                    )}
                                >
                                    <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[120px] flex-shrink-0">
                                        <Switch
                                            checked={weeklySchedule[day.key].enabled}
                                            onCheckedChange={(checked) => updateDaySchedule(day.key, { enabled: checked })}
                                        />
                                        <span
                                            className={cn("font-medium text-sm", !weeklySchedule[day.key].enabled && "text-muted-foreground")}
                                        >
                                            {day.label}
                                        </span>
                                    </div>

                                    {weeklySchedule[day.key].enabled && (
                                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto min-w-0 flex-wrap sm:flex-nowrap">
                                            <Select
                                                value={weeklySchedule[day.key].startTime}
                                                onValueChange={(v) => updateDaySchedule(day.key, { startTime: v })}
                                            >
                                                <SelectTrigger className="w-full sm:w-[100px] sm:min-w-[80px] max-w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-muted-foreground text-sm flex-shrink-0">to</span>
                                            <Select
                                                value={weeklySchedule[day.key].endTime}
                                                onValueChange={(v) => updateDaySchedule(day.key, { endTime: v })}
                                            >
                                                <SelectTrigger className="w-full sm:w-[100px] sm:min-w-[80px] max-w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots
                                                        .filter((t) => t > weeklySchedule[day.key].startTime)
                                                        .map((time) => (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {!weeklySchedule[day.key].enabled && (
                                        <span className="text-sm text-muted-foreground w-full sm:w-auto">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Generate Button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-4 border-t">
                            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                <Label htmlFor="weeks" className="text-sm whitespace-nowrap">
                                    Generate for
                                </Label>
                                <Select value={weeksToGenerate} onValueChange={setWeeksToGenerate}>
                                    <SelectTrigger id="weeks" className="w-full sm:w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 week</SelectItem>
                                        <SelectItem value="2">2 weeks</SelectItem>
                                        <SelectItem value="4">4 weeks</SelectItem>
                                        <SelectItem value="8">8 weeks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleGenerateWeekly} disabled={isGenerating} className="w-full sm:w-auto">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        Generate Availability
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Single Day Tab */}
                    <TabsContent value="single" className="space-y-6">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Add or edit availability for a specific day. Useful for exceptions or one-time changes.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !editDate && "text-muted-foreground",
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {editDate ? format(editDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={editDate}
                                                onSelect={setEditDate}
                                                disabled={(d) => d < new Date() || d > addDays(new Date(), 90)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid grid-cols-2 gap-4 min-w-0">
                                    <div className="space-y-2 min-w-0">
                                        <Label>Start Time</Label>
                                        <Select value={editStartTime} onValueChange={setEditStartTime}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Start" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 min-w-0">
                                        <Label>End Time</Label>
                                        <Select value={editEndTime} onValueChange={setEditEndTime}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="End" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots
                                                    .filter((t) => t > editStartTime)
                                                    .map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddSingleDay}
                                    disabled={isAddingSingle || !editDate || !editStartTime || !editEndTime}
                                    className="w-full"
                                >
                                    {isAddingSingle ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            Add This Availability
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Current availability list */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-medium">Current Availability</h4>

                            {Object.keys(groupedAvailability).length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No availability configured yet. Use the weekly schedule to get started.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {Object.entries(groupedAvailability)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([dateKey, slots]) => (
                                            <div key={dateKey} className="rounded-lg border border-border p-3">
                                                <p className="mb-2 font-medium text-sm">
                                                    {format(new Date(dateKey), "EEEE, MMMM d")}
                                                </p>
                                                <div className="space-y-2">
                                                    {slots.map((slot) => (
                                                        <div key={slot.id} className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                {format(new Date(slot.start_time), "HH:mm")} -{" "}
                                                                {format(new Date(slot.end_time), "HH:mm")}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                onClick={() => handleRemove(slot.id)}
                                                                disabled={removing === slot.id}
                                                            >
                                                                {removing === slot.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}