document.addEventListener('DOMContentLoaded', loadTasks);

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    const taskText = taskInput.value.trim();

    if (taskText === '' || dueDate === '') {
        alert('Task and Due Date are required!');
        return;
    }
    if (!confirm('Are you sure you want to add this task?')) return;

    const taskList = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.draggable = true;
    taskItem.addEventListener('dragstart', dragStart);
    taskItem.addEventListener('dragover', dragOver);
    taskItem.addEventListener('drop', drop);

    taskItem.innerHTML = `
        <span class="task-text">${taskText} (Due: ${dueDate}, Priority: ${priority})</span>
        <span class="task-status"></span> 
        <div>
            <i class="fa-solid fa-check task-icon text-success mx-2" onclick="toggleComplete(this)"></i>
            <i class="fa-solid fa-pen-to-square task-icon text-warning mx-2" onclick="editTask(this)"></i>
            <i class="fa-solid fa-trash task-icon text-danger" onclick="removeTask(this)"></i>
        </div>
    `;

    taskList.appendChild(taskItem);
    updateSerialNumbers();
    saveTasks();
    taskInput.value = '';
}

function updateSerialNumbers() {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach((task, index) => {
        let taskTextElement = task.querySelector('.task-text');
        let textContent = taskTextElement.innerText;
        let newText = textContent.replace(/^\d+\.\s/, ''); // Remove old serial number
        taskTextElement.innerText = `${index + 1}. ${newText}`; // Add new serial number
    });
    saveTasks();
}

function toggleComplete(icon) {
    const taskItem = icon.closest('.task-item');
    const status = taskItem.querySelector('.task-status');

    if (taskItem.classList.contains('completed')) {
        if (!confirm('Are you sure you want to mark this task as incomplete?')) return;
        taskItem.classList.remove('completed');
        status.innerText = "";
        icon.classList.replace('fa-times', 'fa-check');
        icon.classList.replace('text-danger', 'text-success');
    } else {
        if (!confirm('Are you sure you want to mark this task as completed?')) return;
        taskItem.classList.add('completed');
        status.innerText = "✅ Complete";
        icon.classList.replace('fa-check', 'fa-times');
        icon.classList.replace('text-success', 'text-danger');
    }

    saveTasks();
}

function editTask(icon) {
    const taskItem = icon.closest('.task-item');
    const taskTextElement = taskItem.querySelector('.task-text');
    
    let taskDetails = taskTextElement.innerText.match(/^(?:\d+\.\s)?(.+?) \(Due: (.+?), Priority: (.+?)\)$/);
    if (!taskDetails) return;
    
    let [_, taskText, dueDate, priority] = taskDetails;
    
    let newTaskText = prompt('Edit Task:', taskText);
    let newDueDate = prompt('Edit Due Date:', dueDate);
    let newPriority = prompt('Edit Priority:', priority);

    if (newTaskText && newDueDate && newPriority) {
        if (confirm('Are you sure you want to edit this task?')) {
            taskTextElement.innerText = `${newTaskText} (Due: ${newDueDate}, Priority: ${newPriority})`;
            updateSerialNumbers();
        }
    } else {
        alert('All fields are required!');
    }
}

function removeTask(icon) {
    if (confirm('Are you sure you want to delete this task?')) {
        icon.closest('.task-item').remove();
        updateSerialNumbers();
    }
}

function clearAllTasks() {
    if (confirm('Are you sure you want to delete all tasks?')) {
        document.getElementById('taskList').innerHTML = '';
        localStorage.removeItem('tasks');
    }
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(task => {
        let taskText = task.querySelector('.task-text').innerText;
        let isCompleted = task.classList.contains('completed');
        tasks.push({ text: taskText, completed: isCompleted });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('taskList');

    storedTasks.forEach(taskData => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.draggable = true;
        if (taskData.completed) taskItem.classList.add('completed');

        taskItem.innerHTML = `
            <span class="task-text">${taskData.text}</span>
            <span class="task-status">${taskData.completed ? '✅ Complete' : ''}</span>
            <div>
                <i class="fa-solid ${taskData.completed ? 'fa-times text-danger' : 'fa-check text-success'} task-icon mx-2" onclick="toggleComplete(this)"></i>
                <i class="fa-solid fa-pen-to-square task-icon text-warning mx-2" onclick="editTask(this)"></i>
                <i class="fa-solid fa-trash task-icon text-danger" onclick="removeTask(this)"></i>
            </div>
        `;
        taskItem.addEventListener('dragstart', dragStart);
        taskItem.addEventListener('dragover', dragOver);
        taskItem.addEventListener('drop', drop);
        taskList.appendChild(taskItem);
    });

    updateSerialNumbers();
}

// Search Functionality - Fully Fixed
function searchTasks() {
    let searchInput = document.getElementById("searchInput").value.toLowerCase();
    let tasks = document.querySelectorAll(".task-item");

    tasks.forEach(task => {
        let taskText = task.querySelector(".task-text").innerText.toLowerCase();
        if (taskText.includes(searchInput)) {
            task.style.display = "flex";
        } else {
            task.style.display = "none";
        }
    });
}

// Drag & Drop Functionality
let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;
    setTimeout(() => (event.target.style.display = "none"), 0);
}

function dragOver(event) {
    event.preventDefault();
    const taskList = document.getElementById('taskList');
    let afterElement = Array.from(taskList.children).find(task =>
        event.clientY < task.getBoundingClientRect().top + task.clientHeight / 2
    );
    taskList.insertBefore(draggedItem, afterElement);
}

function drop(event) {
    event.preventDefault();
    draggedItem.style.display = "flex";
    updateSerialNumbers();
}
