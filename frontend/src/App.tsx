import React from "react";
import { Routes, Route } from "react-router-dom";
import { HabitList } from "./pages/HabitList";
import { HabitDetail } from "./pages/HabitDetail";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HabitList />} />
        <Route path="/habits/:id" element={<HabitDetail />} />
      </Routes>
    </div>
  );
}

export default App;
