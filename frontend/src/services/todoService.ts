// src/services/todoService.ts
import axios from "axios";
import { Todo } from "../types";

const API_URL = "http://localhost:8080/api/todos";

export const todoService = {
  getAll: async (): Promise<Todo[]> => {
    const response = await axios.get<Todo[]>(API_URL);
    return response.data;
  },

  create: async (title: string): Promise<Todo> => {
    const response = await axios.post<Todo>(API_URL, {
      title,
      completed: false,
    });
    return response.data;
  },

  update: async (todo: Todo): Promise<Todo> => {
    const response = await axios.put<Todo>(`${API_URL}/${todo.id}`, todo);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  toggleTodo: async (id: number): Promise<Todo> => {
    const response = await axios.put<Todo>(`${API_URL}/${id}/toggle`);
    return response.data;
  },
};
