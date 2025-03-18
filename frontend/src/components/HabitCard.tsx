import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import type { Habit } from "../types";

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function HabitCard({
  habit,
  onEdit,
  onDelete,
  onClick,
}: HabitCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("この習慣を削除してもよろしいですか？")) {
      onDelete(habit.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(habit);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{habit.title}</h3>
          {habit.description && (
            <p className="text-gray-600 mt-1">{habit.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
