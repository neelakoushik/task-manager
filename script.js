// Task Manager - plain JavaScript, tasks are saved in localStorage

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const listEl = document.getElementById("taskList");
const emptyMsg = document.getElementById("empty");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (e) { /* storage blocked, the app still works for this visit */ }
}

function render() {
  listEl.textContent = "";

  const visible = tasks.filter(function (t) {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  visible.forEach(function (task) {
    const li = document.createElement("li");
    if (task.done) li.className = "done";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.setAttribute("aria-label", "Mark " + task.title + " as completed");
    check.addEventListener("change", function () {
      task.done = check.checked;
      saveTasks();
      render();
    });

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title;

    const editBtn = document.createElement("button");
    editBtn.className = "small";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () { startEdit(li, task, title, editBtn); });

    const delBtn = document.createElement("button");
    delBtn.className = "small danger";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      render();
    });

    li.append(check, title, editBtn, delBtn);
    listEl.appendChild(li);
  });

  emptyMsg.style.display = visible.length === 0 ? "block" : "none";

  const left = tasks.filter(function (t) { return !t.done; }).length;
  document.getElementById("count").textContent = left + (left === 1 ? " task left" : " tasks left");
}

// swap the title text for a text box so the task can be edited
function startEdit(li, task, titleEl, editBtn) {
  const box = document.createElement("input");
  box.type = "text";
  box.className = "edit-input";
  box.value = task.title;
  box.maxLength = 80;
  li.replaceChild(box, titleEl);
  box.focus();
  editBtn.textContent = "Save";

  function finish() {
    const newTitle = box.value.trim();
    if (newTitle) task.title = newTitle;
    saveTasks();
    render();
  }

  editBtn.onclick = finish;
  box.addEventListener("keydown", function (e) {
    if (e.key === "Enter") finish();
    if (e.key === "Escape") render();
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  tasks.unshift({ id: Date.now(), title: title, done: false });
  saveTasks();
  input.value = "";
  render();
});

document.querySelectorAll(".filter").forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    render();
  });
});

document.getElementById("clearDone").addEventListener("click", function () {
  tasks = tasks.filter(function (t) { return !t.done; });
  saveTasks();
  render();
});

render();
