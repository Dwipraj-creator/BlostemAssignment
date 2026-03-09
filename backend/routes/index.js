const express = require("express");
const router = express.Router();

const { test } = require("../controllers/testController");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController");

// GET /api/test
router.get("/test", test);

// GET /api/tasks
router.get("/tasks", getTasks);

// POST /api/tasks
router.post("/tasks", createTask);

// PATCH /api/tasks/:id
router.patch("/tasks/:id", updateTask);

// DELETE /api/tasks/:id
router.delete("/tasks/:id", deleteTask);

module.exports = router;
