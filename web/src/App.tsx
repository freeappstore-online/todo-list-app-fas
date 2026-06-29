import { useState, useEffect, useCallback } from "react";
import { Shell } from "./components/Shell";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

type Filter = "all" | "active" | "done";

const STORAGE_KEY = "todoapp_todos";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: generateId(), text, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
  }, [input]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
  }, []);

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  const filterLabels: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "done", label: "Done" },
  ];

  return (
    <Shell>
      <div className="max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-1"
            style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
          >
            My Todos
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
          </p>
        </div>

        {/* Input */}
        <div
          className="flex gap-2 mb-6 p-2 rounded-[1.25rem] border"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <input
            type="text"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:opacity-50"
            style={{ color: "var(--ink)" }}
            placeholder="Add a new task…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-5 py-2 rounded-[0.75rem] text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Add
          </button>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 mb-4 p-1 rounded-[1rem] w-fit"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-1.5 rounded-[0.75rem] text-sm font-medium transition-all"
              style={
                filter === key
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--muted)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Todo list */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div
              className="text-center py-16 rounded-[1.25rem] border"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              {filter === "done"
                ? "No completed tasks yet."
                : filter === "active"
                ? "Nothing left to do — great job!"
                : "No tasks yet. Add one above!"}
            </div>
          )}

          {filtered.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border transition-all group"
              style={{
                borderColor: "var(--line)",
                background: "var(--panel)",
                opacity: todo.done ? 0.65 : 1,
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.done ? "Mark as active" : "Mark as done"}
                className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: todo.done ? "var(--accent)" : "var(--line)",
                  background: todo.done ? "var(--accent)" : "transparent",
                }}
              >
                {todo.done && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </button>

              {/* Text */}
              <span
                className="flex-1 text-sm"
                style={{
                  color: "var(--ink)",
                  textDecoration: todo.done ? "line-through" : "none",
                }}
              >
                {todo.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete task"
                className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 w-7 h-7 rounded-[0.5rem] flex items-center justify-center transition-opacity"
                style={{ color: "var(--muted)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="2" y1="2" x2="12" y2="12" />
                  <line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Clear done */}
        {doneCount > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={clearDone}
              className="text-xs px-4 py-2 rounded-[0.75rem] border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              Clear {doneCount} completed
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}
