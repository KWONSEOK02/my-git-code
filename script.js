document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const clearAllBtn = document.getElementById('clearAll');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Render existing tasks
    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = createTaskElement(task, index);
            todoList.appendChild(li);
        });
        saveTasks();
    }

    // Create new task element
    function createTaskElement(task, index) {
        const li = document.createElement('li');
        li.className = 'todo-item' + (task.completed ? ' completed' : '');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(index));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(index));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        return li;
    }

    // Add new task
    function addTask(text) {
        if (text.trim()) {
            tasks.push({ text: text.trim(), completed: false });
            renderTasks();
            taskInput.value = '';
        }
    }

    // Toggle task completion
    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }

    // Delete task
    function deleteTask(index) {
        tasks.splice(index, 1);
        renderTasks();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Event listeners
    addBtn.addEventListener('click', () => addTask(taskInput.value));
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    clearAllBtn.addEventListener('click', () => {
        tasks = [];
        renderTasks();
    });

    // Initial render
    renderTasks();
}); 