import React, { useState, useRef } from "react";
import { X } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AchievementModalProps } from "../types";
import { useParams } from "react-router-dom";
import axios from "axios";

export function AchievementModal({
  isOpen,
  onClose,
}: // onSave,
AchievementModalProps) {
  const { id } = useParams();
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = "http://localhost:8080/api/habits";
  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  const handleHabitDetails = async () => {
    if (!id) return;

    try {
      // FormDataオブジェクトを作成
      const formData = new FormData();
      formData.append("habitId", id);
      formData.append("achievementDate", today);

      // テキストがあれば追加
      if (text) {
        formData.append("notes", text);
      }

      // 時間があれば追加
      if (duration) {
        formData.append("duration", duration.toString());
      }

      // 写真があれば追加
      if (photo) {
        formData.append("photo", photo);
      }

      // FormDataを使ってデータを送信
      await axios.post(`${API_URL}/${id}/details/${today}`, formData);

      // 成功したら閉じる
      onClose();
    } catch (err) {
      console.error("詳細の記録中にエラーが発生しました:", err);
      alert("詳細の記録に失敗しました。");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">今日の達成を記録</h2>
        <form onSubmit={handleHabitDetails}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              達成メモ *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 255))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
              maxLength={255}
            />
            <p className="text-sm text-gray-500 mt-1">{text.length}/255文字</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              写真
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              ref={fileInputRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所要時間
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                onChange={(e) =>
                  setDuration(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">分</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              記録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
