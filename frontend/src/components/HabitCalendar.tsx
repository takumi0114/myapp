import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HabitCalendarProps {
  habitId: string;
  achievements: Record<string, boolean>;
  onToggleAchievement: (date: string) => void;
  startDate: Date;
}

const monthNames = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

export function HabitCalendar({
  habitId,
  achievements,
  onToggleAchievement,
  startDate,
}: HabitCalendarProps) {
  const today = new Date(2024, 2, 18); // 3月18日に固定
  const [currentDate, setCurrentDate] = useState(today);

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      year,
      month,
      days: generateCalendarDays(year, month),
    };
  };

  const prevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  const nextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  const getDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const renderCalendar = (date: Date) => {
    const { year, month, days } = getMonthData(date);

    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-2 text-center">
          {`${year}年 ${monthNames[month]}`}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-8" />;
            }

            const dateStr = getDateString(day);
            const isToday = day.getDate() === 18 && day.getMonth() === 2; // 3月18日チェック
            const isPast = day < today;
            const isAfterStart = day >= startDate;
            const isAchieved = achievements[dateStr];
            const shouldShowStatus = (isPast || isToday) && isAfterStart;

            return (
              <div
                key={dateStr}
                className={`h-8 flex items-center justify-center relative cursor-pointer
                  ${isToday ? "font-bold" : ""}
                  ${shouldShowStatus ? "hover:bg-gray-100" : ""}`}
                onClick={() => shouldShowStatus && onToggleAchievement(dateStr)}
              >
                <span
                  className={`z-10 relative ${isToday ? "text-gray-900" : ""}`}
                >
                  {day.getDate()}
                </span>
                {shouldShowStatus && (
                  <div
                    className={`absolute inset-1 rounded-full transition-colors duration-300
                      ${isAchieved ? "bg-green-500" : "bg-red-500"} 
                      ${isToday ? "opacity-60" : "opacity-20"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </span>
        <button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderCalendar(prevMonth)}
        {renderCalendar(currentDate)}
        {renderCalendar(nextMonth)}
      </div>
    </div>
  );
}
