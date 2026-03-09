import { useEffect, useMemo, useState } from "react";
const API = `${import.meta.env.VITE_API_URL}/api/tasks`;

function getPriority(task) {
  if (task.priority) return task.priority;

  if (task.completed) return "Low";
  if (task.title.length > 20) return "High";
  return "Medium";
}

function PriorityBadge({ priority }) {
  const color =
    {
      High: "#e74c3c",
      Medium: "#f39c12",
      Low: "#27ae60",
    }[priority] || "#7f8c8d";

  return (
    <span
      style={{
        backgroundColor: color,
        color: "white",
        padding: "0.2rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      {priority}
    </span>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isEditing,
  editTitle,
  setEditTitle,
}) {
  const priority = useMemo(() => getPriority(task), [task]);

  return (
    <li
      key={task.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        marginBottom: "0.5rem",
        background: "white",
        color: "#1f2937",
      }}
    >
      <div style={{ flex: 1, marginRight: "1rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: "0.4rem",
                padding: "0.4rem",
              }}
            />
          ) : (
            task.title
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <PriorityBadge priority={priority} />
          <span style={{ color: "#4a5568", fontSize: "0.85rem" }}>
            {task.completed ? "Completed" : "Incomplete"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={() => onSaveEdit(task)}
              style={{
                border: "1px solid #60a5fa",
                background: "#60a5fa",
                color: "white",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => onCancelEdit()}
              style={{
                border: "1px solid #cbd5e1",
                background: "#f1f5f9",
                color: "#1f2937",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onToggle(task)}
              style={{
                border: "1px solid #cbd5e1",
                background: task.completed ? "#22c55e" : "#f1f5f9",
                color: task.completed ? "white" : "#1f2937",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
            >
              {task.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button
              type="button"
              onClick={() => onStartEdit(task)}
              style={{
                border: "1px solid #cbd5e1",
                background: "#f1f5f9",
                color: "#1f2937",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
            >
              ⋯
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              style={{
                border: "1px solid #f87171",
                background: "#fee2e2",
                color: "#991b1b",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch(API, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTasks(data.tasks ?? []);
        setStatus("success");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const createTask = async (title) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || `HTTP ${res.status}`);
    }

    const { task } = await res.json();
    setTasks((current) => [...current, task]);
  };

  const updateTask = async (task, changes) => {
    const res = await fetch(`${API}/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || `HTTP ${res.status}`);
    }

    const { task: updated } = await res.json();
    setTasks((current) =>
      current.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const deleteTask = async (task) => {
    const res = await fetch(`${API}/${task.id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || `HTTP ${res.status}`);
    }

    setTasks((current) => current.filter((t) => t.id !== task.id));
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    if (!newTitle.trim()) return;

    try {
      setStatus("loading");
      await createTask(newTitle.trim());
      setNewTitle("");
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleToggle = async (task) => {
    try {
      setStatus("loading");
      await updateTask(task, { completed: !task.completed });
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleStartEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSaveEdit = async (task) => {
    try {
      setStatus("loading");
      await updateTask(task, { title: editingTitle });
      setEditingId(null);
      setEditingTitle("");
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleDelete = async (task) => {
    try {
      setStatus("loading");
      await deleteTask(task);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  if (status === "loading") {
    return <p>Loading tasks…</p>;
  }

  if (status === "error") {
    return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Tasks</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: "1rem" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
          style={{
            padding: "0.5rem",
            width: "100%",
            maxWidth: "320px",
            border: "1px solid #cbd5e1",
            borderRadius: "0.4rem",
            marginRight: "0.5rem",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.4rem",
            border: "1px solid #60a5fa",
            background: "#60a5fa",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add Task
        </button>
      </form>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "0.4rem",
              border: "1px solid #cbd5e1",
              background: filter === option.key ? "#60a5fa" : "#f1f5f9",
              color: filter === option.key ? "white" : "#1f2937",
              cursor: "pointer",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isEditing={editingId === task.id}
            editTitle={editingTitle}
            setEditTitle={setEditingTitle}
          />
        ))}
      </ul>
    </div>
  );
}
