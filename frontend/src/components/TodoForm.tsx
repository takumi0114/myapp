// src/components/TodoForm.tsx
import React, { FC, FormEvent, ChangeEvent, useState } from "react";

interface TodoFormProps {
  onAdd: (title: string) => void;
}

const TodoForm: FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
        placeholder="新しいタスクを入力..."
        className="todo-input"
      />
      <button type="submit" className="add-button">
        追加
      </button>
    </form>
  );
};

export default TodoForm;
