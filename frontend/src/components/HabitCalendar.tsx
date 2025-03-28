import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// コンポーネントのプロパティ型定義
interface HabitCalendarProps {
  habitId: string;
  achievements: Record<string, boolean>;
  startDate: Date;
  todayStatus: boolean; // 今日の達成状態を親から受け取る
  habitDetails: Record<string, any>;
  onClickDate: (date: string) => void;
}

// 月の日本語名
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

// 曜日の日本語名
const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

// 月の日数を取得
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// 月の最初の日の曜日を取得
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// カレンダーの日付配列を生成
const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];

  // 月の初めの空白セル
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // 月の各日を追加
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

export function HabitCalendar({
  habitId,
  achievements,
  startDate,
  todayStatus,
  habitDetails,
  onClickDate,
}: HabitCalendarProps) {
  // 実際の今日の日付（固定）
  const realToday = new Date();

  // 現在表示中の月（変更可能）
  const [currentMonth, setCurrentMonth] = useState(realToday);

  // 月データを取得
  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      year,
      month,
      days: generateCalendarDays(year, month),
    };
  };

  // 前月と次月の日付
  const prevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1
  );
  const nextMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  );

  // 日付を文字列形式に変換（YYYY-MM-DD）
  // タイムゾーンを考慮した日付文字列の生成
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 月のカレンダーをレンダリング
  const renderCalendar = (date: Date) => {
    const { year, month, days } = getMonthData(date);

    return (
      <div className="w-full">
        {/* 月と年の表示 */}
        <h3 className="text-lg font-semibold mb-2 text-center">
          {`${year}年 ${monthNames[month]}`}
        </h3>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-1">
          {/* 曜日のヘッダー */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}

          {/* 日付のセル */}
          {days.map((day, index) => {
            // 空のセル
            if (!day) {
              return <div key={`empty-${index}`} className="h-8" />;
            }

            // 日付の文字列形式
            const dateStr = getDateString(day);

            // 今日の日付かどうか
            const isToday =
              day.getDate() === realToday.getDate() &&
              day.getMonth() === realToday.getMonth() &&
              day.getFullYear() === realToday.getFullYear();

            // 過去の日付かどうか
            const isPast = day <= realToday;

            const normalizedStartDate = new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
            );

            // 習慣開始日以降かどうか
            const isAfterStart = day >= normalizedStartDate;

            // 達成状態（今日の場合は親から受け取った値を使用）
            const isAchieved = isToday
              ? todayStatus
              : achievements[dateStr] === true;

            // 達成状態を表示すべきかどうか
            const shouldShowStatus = (isPast || isToday) && isAfterStart;

            return (
              <div
                key={dateStr}
                className={`h-8 flex items-center justify-center relative
                  ${isToday ? "font-bold" : ""}`}
                onClick={() => onClickDate(dateStr)}
              >
                {/* 日付の数字 */}
                <span
                  className={`z-10 relative ${isToday ? "text-gray-900" : ""}`}
                >
                  {day.getDate()}
                </span>

                {/* 達成状態の背景 */}
                {shouldShowStatus && (
                  <div
                    className={`absolute inset-1 rounded-full transition-colors duration-300
                      ${isAchieved ? "bg-green-500" : "bg-red-500"} 
                      ${isToday ? "opacity-60" : "opacity-20"}`}
                  />
                )}

                {/* ここで色変えようかなと思っている */}
                {habitDetails[dateStr] && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full cursor-pointer" />
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
      {/* カレンダーナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        {/* 前月ボタン */}
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {/* 現在の月表示 */}
        <span className="font-medium">
          {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
        </span>

        {/* 次月ボタン */}
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* カレンダーグリッド（前月、当月、次月） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderCalendar(prevMonth)}
        {renderCalendar(currentMonth)}
        {renderCalendar(nextMonth)}
      </div>
    </div>
  );
}
