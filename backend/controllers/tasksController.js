const tasks = [
  { id: 1, title: "Buy groceries", completed: false },
  { id: 2, title: "Walk the dog", completed: true },
  { id: 3, title: "Write reply", completed: false },
];

let nextId = tasks.length + 1;

exports.getTasks = (req, res) => {
  res.json({ tasks });
};

exports.createTask = (req, res) => {
  const { title, completed } = req.body;

  // Simple validation
  if (typeof title !== "string" || title.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "title is required and must be a non-empty string" });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be a boolean" });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: completed === undefined ? false : completed,
  };

  tasks.push(newTask);

  res.status(201).json({ task: newTask });
};

exports.updateTask = (req, res) => {
  const taskId = Number(req.params.id);
  const existing = tasks.find((t) => t.id === taskId);

  if (!existing) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "title must be a non-empty string" });
    }

    existing.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }

    existing.completed = completed;
  }

  res.json({ task: existing });
};

exports.deleteTask = (req, res) => {
  const taskId = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);

  res.status(204).end();
};
