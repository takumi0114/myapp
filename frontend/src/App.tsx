// src/App.tsx (サービス使用バージョン)
import React, { useState, useEffect } from "react";
import { Todo } from "./types";
import { todoService } from "./services/todoService";
import TodoList from "./components/TodoList";
import TodoForm from "./components/TodoForm";
import "./App.css";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await todoService.getAll();
      setTodos(data);
    } catch (err) {
      setError("Todoの取得に失敗した、あるいは存在していません");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string): Promise<void> => {
    try {
      const newTodo = await todoService.create(title);
      setTodos([...todos, newTodo]);
    } catch (err) {
      setError("Todoの追加に失敗しました");
      console.error(err);
    }
  };

  const toggleTodo = async (id: number, completed: boolean): Promise<void> => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = await todoService.update({
        ...todo,
        completed: !completed,
      });
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err) {
      setError("Todoの更新に失敗しました");
      console.error(err);
    }
  };

  const deleteTodo = async (id: number): Promise<void> => {
    try {
      await todoService.delete(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      setError("Todoの削除に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todoリスト (TypeScript)</h1>
      </header>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        <TodoForm onAdd={addTodo} />

        {isLoading ? (
          <p className="loading-message">読み込み中...</p>
        ) : (
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        )}
      </div>
    </div>
  );
}

export default App;
