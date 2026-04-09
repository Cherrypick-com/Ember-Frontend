"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Call {
  id: string;
  scheduled_time: string;
  recurrence?: string;
  goal_title?: string;
  status?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  calls: { time: string; call: Call }[];
}

function getRecurringDates(call: Call, monthStart: Date, monthEnd: Date): Date[] {
  const base = new Date(call.scheduled_time);
  const dates: Date[] = [];

  if (!call.recurrence || call.recurrence === "once") {
    if (base >= monthStart && base <= monthEnd) dates.push(base);
    return dates;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(monthStart);
  while (cursor <= monthEnd) {
    const dayOfWeek = cursor.getDay(); // 0=Sun, 6=Sat
    let matches = false;

    if (call.recurrence === "daily") {
      matches = cursor >= today;
    } else if (call.recurrence === "weekdays") {
      matches = cursor >= today && dayOfWeek >= 1 && dayOfWeek <= 5;
    } else if (call.recurrence === "weekly") {
      matches = cursor >= today && dayOfWeek === base.getDay();
    }

    if (matches) {
      const d = new Date(cursor);
      d.setHours(base.getHours(), base.getMinutes(), base.getSeconds());
      dates.push(d);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function UpcomingCallsCalendar() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.calls.list()
      .then((data) => setCalls(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  // Build a map: dateKey -> { time, call }[]
  const callMap: Record<string, { time: string; call: Call }[]> = {};

  for (const call of calls) {
    const dates = getRecurringDates(call, monthStart, monthEnd);
    for (const d of dates) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!callMap[key]) callMap[key] = [];
      callMap[key].push({ time: formatTime(d), call });
    }
  }

  // Build calendar grid (always 6 rows x 7 cols)
  const firstDayOfWeek = monthStart.getDay();
  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - firstDayOfWeek + i);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      calls: callMap[key] || [],
    });
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthLabel = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500">&#8249;</button>
        <span className="font-semibold text-gray-800 text-sm">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500">&#8250;</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      {loading ? (
        <div className="text-center text-sm text-gray-400 py-8">Loading calls...</div>
      ) : (
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, i) => {
            const isToday = isSameDay(day.date, today);
            const hasCalls = day.calls.length > 0;
            const isSelected = selectedDay && isSameDay(day.date, selectedDay.date);

            return (
              <button
                key={i}
                onClick={() => hasCalls ? setSelectedDay(isSelected ? null : day) : setSelectedDay(null)}
                className={[
                  "relative flex flex-col items-center py-1 rounded-lg transition-colors",
                  day.isCurrentMonth ? "text-gray-800" : "text-gray-300",
                  isToday ? "font-bold" : "",
                  isSelected ? "bg-orange-50 ring-1 ring-orange-300" : hasCalls ? "hover:bg-gray-50 cursor-pointer" : "cursor-default",
                ].join(" ")}
              >
                <span className={[
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-orange-500 text-white" : "",
                ].join(" ")}>
                  {day.date.getDate()}
                </span>
                {hasCalls && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected day detail */}
      {selectedDay && selectedDay.calls.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {selectedDay.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <div className="space-y-2">
            {selectedDay.calls.map(({ time, call }, i) => (
              <div key={i} className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-sm text-orange-900 font-medium">{time}</span>
                {call.goal_title && (
                  <span className="text-sm text-orange-700 truncate">— {call.goal_title}</span>
                )}
                {call.recurrence && call.recurrence !== "once" && (
                  <span className="ml-auto text-xs text-orange-400 capitalize">{call.recurrence}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
