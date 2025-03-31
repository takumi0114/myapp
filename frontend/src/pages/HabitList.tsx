import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Modal } from "../components/Modal";
import { HabitCard } from "../components/HabitCard";
import { Pagination } from "../components/Pagination";
import type { Habit } from "../types";

import axios from "axios";

export function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  // Calculate pagination
  const totalPages = Math.ceil(habits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentHabits = habits.slice(startIndex, endIndex);
  const API_URL = "http://localhost:8080/api/habits";

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get<Habit[]>(API_URL);

      // 配列を反転させて、最後の要素を最初に表示する
      const reversedHabits = [...response.data].reverse();

      setHabits(reversedHabits);
    } catch (error) {
      console.error("習慣の取得中にエラーが発生しました:", error);
      alert("習慣の取得中にエラーが発生しました");
    }
  };

  // 新しい習慣をデータベースに保存する関数
  const handleAddHabit = async (habitData: Omit<Habit, "id" | "createdAt">) => {
    try {
      // バックエンドAPIの期待する形式に変換
      const habitToSave = {
        title: habitData.title,
        description: habitData.description,
      };
      // APIリクエストを送信
      const response = await axios.post<Habit>(API_URL, habitToSave);

      // レスポンスからIDと作成日を取得
      const newHabit: Habit = {
        id: response.data.id as unknown as string, // バックエンドからのIDは数値かもしれないため変換
        title: habitData.title,
        description: habitData.description,
        createdAt: new Date(response.data.createdAt || new Date()),
      };

      // ローカルの状態を更新
      // データベースに値は入っているが、リロード後表示されない問題がある
      setHabits((prev) => [newHabit, ...prev]);
    } catch (error) {
      console.error("習慣の保存中にエラーが発生しました:", error);
      alert("習慣の保存中にエラーが発生しました");
    }
  };

  // 既存の習慣を更新する関数
  const handleEditHabit = async (
    habitData: Omit<Habit, "id" | "createdAt">
  ) => {
    if (!editingHabit) return;

    try {
      // バックエンドAPIの期待する形式に変換
      const habitToUpdate = {
        title: habitData.title,
        description: habitData.description,
      };

      // APIリクエストを送信
      await axios.put(`${API_URL}/${editingHabit.id}`, habitToUpdate);

      // ローカルの状態を更新
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === editingHabit.id ? { ...habit, ...habitData } : habit
        )
      );
    } catch (error) {
      console.error("習慣の更新中にエラーが発生しました:", error);
      alert("習慣の更新中にエラーが発生しました");
    }
  };

  // 習慣を削除する関数
  const handleDeleteHabit = async (id: string) => {
    try {
      // APIリクエストを送信
      await axios.delete(`${API_URL}/${id}`);

      // ローカルの状態を更新
      setHabits((prev) => prev.filter((habit) => habit.id !== id));

      // 最後のアイテムが削除された場合、ページを調整
      const totalPages = Math.ceil((habits.length - 1) / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("習慣の削除中にエラーが発生しました:", error);
      alert("習慣の削除中にエラーが発生しました");
    }
  };

  const openModal = (habit?: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingHabit(undefined);
    setIsModalOpen(false);
  };

  const handleHabitClick = (habit: Habit) => {
    navigate(`/habits/${habit.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Good Habit</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>新規追加</span>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currentHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={openModal}
              onDelete={handleDeleteHabit}
              onClick={() => handleHabitClick(habit)}
            />
          ))}
        </div>

        {habits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              習慣が登録されていません。「新規追加」ボタンから習慣を追加してください。
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          habit={editingHabit}
          onSave={editingHabit ? handleEditHabit : handleAddHabit}
        />
      </div>
    </div>
  );
}
