const { Router } = require("express");

const {
  getToDo,
  saveToDo,
  deleteToDo,
  updateToDo,
  updateStatus,
} = require("../controllers/ToDoController");

const router = Router();

router.post("/get-todo", getToDo);

router.post("/save-todo", saveToDo);

router.post("/delete-todo", deleteToDo);

router.post("/update-todo", updateToDo);

router.post("/update-status", updateStatus);

module.exports = router;
