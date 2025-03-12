// src/components/TodoList.tsx
import React, { FC, useState, useEffect } from "react";
import { Todo } from "../types";
import { todoService } from "../services/todoService";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

const TodoList: FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  const [localTodos, setLocalTodos] = useState<Todo[]>(todos);

  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

  const handleToggle = async (id: number) => {
    try {
      // まずローカルの状態を即時更新
      setLocalTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      // その後バックエンドと同期
      const updatedTodo = await todoService.toggleTodo(id);

      // バックエンドの応答で最終的な状態を更新
      setLocalTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );

      onToggle(id, updatedTodo.completed);
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await todoService.getAll();
        setLocalTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
    fetchTodos();
  }, []);

  if (localTodos.length === 0) {
    return <li className="empty-message">タスクがありません</li>;
  }

  return (
    <ul className="todo-list">
      {localTodos.map((todo) => (
        <li
          key={todo.id}
          className={`todo-item ${todo.completed ? "completed" : ""}`}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id)}
          />
          <span className="todo-text">{todo.title}</span>
          <button onClick={() => onDelete(todo.id)} className="delete-button">
            削除
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
