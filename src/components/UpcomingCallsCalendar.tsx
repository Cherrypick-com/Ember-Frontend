"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ScheduledCall } from "@/types";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  calls: { time: string; call: ScheduledCall }[];
}

function getRecurringDates(call: ScheduledCall, monthStart: Date, monthEnd: Date): Date[] {
  const base = new Date(call.scheduledAt);
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const recurrenceValue = call.recurrence as string;
  if (!recurrenceValue || recurrenceValue === "once") {
    if (base >= monthStart && base <= monthEnd) dates.push(base);
    return dates;
  }

  let cursor = new Date(monthStart);
  while (cursor <= monthEnd) {
    const dow = cursor.getDay();
    let matches = false;
    if (recurrenceValue === "daily") matches = cursor >= today;
    else if (recurrenceValue === "weekdays") matches = cursor >= today && dow >= 1 && dow <= 5;
    else if (recurrenceValue === "weekly") matches = cursor >= today && dow === base.getDay();
    if (matches) {
      const d = new Date(cursor);
      d.setHours(base.getHours(), base.getMinutes(), 0);
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
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function UpcomingCallsCalendar() {
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.calls.list("d05adcfb-62d3-45ee-9911-df183097e3a0")
      .then((data: any) => setCalls(data?.calls || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const callMap: Record<string, { time: string; call: ScheduledCall }[]> = {};
  for (const call of calls) {
    for (const d of getRecurringDates(call, monthStart, monthEnd)) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!callMap[key]) callMap[key] = [];
      callMap[key].push({ time: formatTime(d), call });
    }
  }

  const firstDayOfWeek = monthStart.getDay();
  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - firstDayOfWeek + i);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    days.push({ date, isCurrentMonth: date.getMonth() === month, calls: callMap[key] || [] });
  }

  const today = new Date();
  const monthLabel = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #f0f0f0", padding: 16, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#999", padding: "0 8px" }}>‹</button>
        <span style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{monthLabel}</span>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#999", padding: "0 8px" }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#aaa", fontWeight: 500, padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: 24, fontSize: 13 }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
          {days.map((day, i) => {
            const isToday = isSameDay(day.date, today);
            const hasCalls = day.calls.length > 0;
            const isSelected = selectedDay && isSameDay(day.date, selectedDay.date);
            return (
              <button
                key={i}
                onClick={() => hasCalls ? setSelectedDay(isSelected ? null : day) : setSelectedDay(null)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "4px 0", background: isSelected ? "#fff5f0" : "none",
                  border: isSelected ? "1px solid #ffb38a" : "1px solid transparent",
                  borderRadius: 8, cursor: hasCalls ? "pointer" : "default"
                }}
              >
                <span style={{
                  fontSize: 12, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%", fontWeight: isToday ? 700 : 400,
                  background: isToday ? "#f97316" : "none",
                  color: isToday ? "white" : day.isCurrentMonth ? "#333" : "#ccc"
                }}>
                  {day.date.getDate()}
                </span>
                {hasCalls && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", marginTop: 2 }} />}
              </button>
            );
          })}
        </div>
      )}

      {selectedDay && selectedDay.calls.length > 0 && (
        <div style={{ marginTop: 12, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            {selectedDay.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          {selectedDay.calls.map(({ time, call }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff5f0", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#c2410c" }}>{time}</span>
              {(call.recurrence as string) && (call.recurrence as string) !== "once" && (
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#f97316", textTransform: "capitalize" }}>{call.recurrence}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
