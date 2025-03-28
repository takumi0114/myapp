import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react";
import { ProgressBar } from "../components/ProgressBar";
import { HabitCalendar } from "../components/HabitCalendar";
import { DetailModal } from "../components/DetailModal";
import axios from "axios";
import type { Habit } from "../types";
import { AchievementModal } from "../components/AchievementModal";

const TARGET_DAYS = 66;
const API_URL = "http://localhost:8080/api/habits";

export function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<Habit | undefined>();
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitDetails, setHabitDetails] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 今日の日付を取得
  const today = new Date().toISOString().split("T")[0];
  const isAchievedToday = achievements[today] === true;

  const fetchHabitDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // 習慣の詳細を取得
      const habitResponse = await axios.get(`${API_URL}/${id}`);
      setHabit(habitResponse.data);

      // 習慣の達成記録を取得
      const achievementsResponse = await axios.get(
        `${API_URL}/${id}/achievements`
      );

      // APIレスポンスを適切な形式に変換
      const achievementsData = achievementsResponse.data.reduce(
        (acc: Record<string, boolean>, item: any) => {
          acc[item.achievementDate] = item.achieved;
          return acc;
        },
        {}
      );

      // 今日の日付が含まれていない場合は追加
      if (achievementsData[today] === undefined) {
        achievementsData[today] = false;
      }

      setAchievements(achievementsData);
      setLoading(false);
    } catch (err) {
      console.error("データの取得中にエラーが発生しました:", err);
      setError("習慣データの取得に失敗しました。");
      setLoading(false);
    }
  };

  // 詳細データを取得する関数
  const fetchHabitDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/${id}/details`);

      // 日付をキーとするオブジェクトに変換
      const detailsMap = response.data.reduce(
        (acc: Record<string, any>, detail: any) => {
          acc[detail.date] = detail;
          return acc;
        },
        {}
      );

      setHabitDetails(detailsMap);
    } catch (error) {
      console.error("詳細の取得中にエラーが発生しました:", error);
    }
  };

  useEffect(() => {
    fetchHabitDetail();
    fetchHabitDetails();
  }, [id]);

  // useEffect(() => {
  //   console.log("セレクトデータ", selectedDate);
  // }, [selectedDate]);

  // useEffect(() => {
  //   console.log("ハビット出ている", habitDetails);
  // }, [habitDetails]);

  // 今日の達成状態を切り替える
  const handleTodayAchievement = async () => {
    if (!id) return;

    try {
      // 現在と反対の状態を設定
      const newStatus = !isAchievedToday;

      // バックエンドに達成状況の更新を送信
      await axios.post(`${API_URL}/${id}/achievements`, {
        habitId: id,
        achievementDate: today,
        achieved: newStatus,
      });

      // 成功したら、ローカルの状態を更新
      setAchievements({
        ...achievements,
        [today]: newStatus,
      });
      if (isAchievedToday === false) {
        setIsAchievementModalOpen(true);
      } else {
        if (
          window.confirm(
            "未達成に変更すると、この日の詳細記録が削除されます。よろしいですか？"
          )
        ) {
          try {
            // 詳細記録を削除
            await axios.delete(`${API_URL}/${id}/details/${today}`);

            // UIの更新など
          } catch (error) {
            console.error("詳細の削除中にエラーが発生しました:", error);
          }
        }
      }
    } catch (err) {
      console.error("達成状況の更新中にエラーが発生しました:", err);
      alert("達成状況の更新に失敗しました。");
    }
  };

  const handleClickDate = (date: string) => {
    setSelectedDate(date);
    setIsDetailModalOpen(true);
  };

  // 達成進捗率を計算
  const calculateProgress = () => {
    if (!habit) return 0;
    const achievedDays = Object.values(achievements).filter((v) => v).length;
    return Math.min(Math.round((achievedDays / TARGET_DAYS) * 100), 100);
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  // エラーまたは習慣が見つからない場合の表示
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

  // 習慣詳細の表示
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー部分 */}
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

        {/* 達成ボタン */}
        <button
          onClick={handleTodayAchievement}
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

      {/* メインコンテンツ */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 習慣タイトルと基本情報 */}
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

        {/* 習慣の詳細情報 */}
        <div className="p-8">
          {/* 詳細説明 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">詳細</h2>
            <p className="text-gray-600 leading-relaxed">
              {habit.description || "なし"}
            </p>
          </div>

          {/* 進捗バー */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">進捗状況</h2>
            <ProgressBar percentage={calculateProgress()} />
          </div>

          {/* カレンダー */}
          <div>
            <h2 className="text-xl font-semibold mb-4">記録カレンダー</h2>
            <HabitCalendar
              habitId={habit.id}
              achievements={achievements}
              startDate={new Date(habit.createdAt)}
              todayStatus={isAchievedToday}
              habitDetails={habitDetails}
              onClickDate={handleClickDate}
            />
          </div>

          <DetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            detail={selectedDate ? habitDetails[selectedDate] : null}
            date={selectedDate || ""}
          />
        </div>
      </div>

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        // onSave={handleSaveAchievement}
      />
    </div>
  );
}
