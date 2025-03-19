import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react";
import { ProgressBar } from "../components/ProgressBar";
import { HabitCalendar } from "../components/HabitCalendar";
import axios from "axios";
import type { Habit } from "../types";

const TARGET_DAYS = 66;

export function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<Habit | undefined>();
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = "http://localhost:8080/api/habits";
  const today = new Date().toISOString().split("T")[0];
  const isAchievedToday = achievements[today];

  // 習慣の詳細を取得
  useEffect(() => {
    const fetchHabitDetails = async () => {
      try {
        setLoading(true);
        // 習慣の詳細を取得
        const habitResponse = await axios.get(`${API_URL}/${id}`);

        setHabit(habitResponse.data);

        // // 習慣の達成記録を取得
        // const achievementsResponse = await axios.get(
        //   `/api/habits/${id}/achievements`
        // );

        // // APIレスポンスを適切な形式（Record<string, boolean>）に変換
        // const achievementsData = achievementsResponse.data.reduce(
        //   (acc: Record<string, boolean>, item: any) => {
        //     acc[item.date] = item.achieved;
        //     return acc;
        //   },
        //   {}
        // );

        // // 今日の日付が含まれていない場合は追加
        // const today = new Date().toISOString().split("T")[0];
        // if (achievementsData[today] === undefined) {
        //   achievementsData[today] = false;
        // }

        // setAchievements(achievementsData);
        setLoading(false);
      } catch (err) {
        console.error("データの取得中にエラーが発生しました:", err);
        setError("習慣データの取得に失敗しました。");
        setLoading(false);
      }
    };

    if (id) {
      fetchHabitDetails();
    }
  }, [id]);

  const handleToggleAchievement = async (date: string) => {
    try {
      const newStatus = !achievements[date];

      // バックエンドに達成状況の更新を送信
      await axios.post(`/api/habits/${id}/achievements`, {
        date: date,
        achieved: newStatus,
      });

      // 成功したら、ローカルの状態を更新
      setAchievements((prev) => ({
        ...prev,
        [date]: newStatus,
      }));
    } catch (err) {
      console.error("達成状況の更新中にエラーが発生しました:", err);
      alert("達成状況の更新に失敗しました。");
    }
  };

  const calculateProgress = () => {
    if (!habit) return 0;
    const achievedDays = Object.values(achievements).filter((v) => v).length;
    return Math.min(Math.round((achievedDays / TARGET_DAYS) * 100), 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !habit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>戻る</span>
        </button>
        <div className="text-center py-12">
          <p className="text-gray-500">
            {error || "習慣が見つかりませんでした。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>戻る</span>
        </button>
        <button
          onClick={() => handleToggleAchievement(today)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-300
            ${
              isAchievedToday
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
        >
          <CheckCircle size={20} />
          <span>{isAchievedToday ? "達成済み" : "未達成"}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">{habit.title}</h1>
          <div className="flex items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                開始日: {new Date(habit.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>平均的な習慣定着日数: {TARGET_DAYS}日</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">詳細</h2>
            <p className="text-gray-600 leading-relaxed">
              {habit.description || "なし"}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">進捗状況</h2>
            <ProgressBar percentage={calculateProgress()} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">記録カレンダー</h2>
            <HabitCalendar
              habitId={habit.id}
              achievements={achievements}
              onToggleAchievement={handleToggleAchievement}
              startDate={new Date(habit.createdAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
