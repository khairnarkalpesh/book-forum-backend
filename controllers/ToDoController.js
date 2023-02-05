const ToDoModel = require("../models/ToDoModal");
const mongoose = require("mongoose");

// Get todo
exports.getToDo = async (req, res) => {
  const { user } = req.body.options;
  const todo = await ToDoModel.find({
    user: user,
  });
  res.send(todo);
};
// Create todo
exports.saveToDo = (req, res) => {
  const { text, user } = req.body.options;

  ToDoModel.create({
    text: text,
    user: user,
  })
    .then(() => res.set(201).send("Added Successfully..."))
    .catch((err) => console.log(err));
};

// Delete todo
exports.deleteToDo = (req, res) => {
  const { _id } = req.body;

  ToDoModel.findByIdAndDelete(_id)
    .then(() => res.set(201).send("Deleted Successfully..."))
    .catch((err) => console.log(err));
};

// update todo
exports.updateToDo = (req, res) => {
  const { _id, text } = req.body;

  ToDoModel.findByIdAndUpdate(_id, { text })
    .then(() => res.set(201).send("Updated Successfully..."))
    .catch((err) => console.log(err));
};

// Update status
exports.updateStatus = (req, res) => {
  let { _id, status } = req.body;
  _id = mongoose.Types.ObjectId(_id);

  ToDoModel.findByIdAndUpdate(_id, { status })
    .then(() => res.set(201).send("Status updated Successfully..."))
    .catch((err) => console.log(err));
};
