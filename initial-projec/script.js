document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    let tasks = [];

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        addTask();
    });

    function addTask() {
        // Get input values
        const taskName = document.getElementById('taskName').value.trim();
        const taskTime = document.getElementById('taskTime').value;
        const taskDependency = document.getElementById('taskDependency').value.trim();
        const taskDuration = parseInt(document.getElementById('taskDuration').value);

        const startTime = new Date(taskTime);

        if (startTime < new Date()) {
            alert('Task start time cannot be in the past.');
            return;
        }

        // Create task object
        const task = {
            name: taskName,
            time: startTime.toISOString(),
            dependency: taskDependency || null,
            duration: taskDuration,
            status: 'Scheduled'
        };

        // Check for duplicate task names
        if (tasks.find(t => t.name === task.name)) {
            alert('A task with this name already exists.');
            return;
        }

        // Add task to list and save to localStorage
        tasks.push(task);
        saveTaskToLocalStorage(task);

        // Append task to list
        appendTaskToList(task);

        // Schedule the task
        scheduleTask(task);

        // Reset the form
        form.reset();
    }

    function appendTaskToList(task) {
        const row = document.createElement('tr');
        row.id = task.name;

        row.innerHTML = `
            <td>${task.name}</td>
            <td>${new Date(task.time).toLocaleString()}</td>
            <td>${task.status}</td>
            <td>${task.dependency || '-'}</td>
        `;

        // Create delete button
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.style = 'font-size:16px;background-color:#a83236;background-image:none;color:#fff;cursor:pointer';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function () {
            removeTask(row, task);
        };
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        taskList.appendChild(row);
    }

    function updateTaskInDOMAndStorage(updatedTask) {
        // Update in tasks array
        tasks = tasks.map(task => task.name === updatedTask.name ? updatedTask : task);

        // Update in localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Update in DOM
        const row = document.getElementById(updatedTask.name);
        if (row) {
            row.cells[2].textContent = updatedTask.status;
        }
    }

    function saveTaskToLocalStorage(task) {
        let storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        storedTasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(storedTasks));
    }

    function loadTasksFromLocalStorage() {
        let storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = storedTasks;

        for (let task of tasks) {
            appendTaskToList(task);
            scheduleTask(task);
        }
    }

    function removeTask(row, task) {
        // Remove from tasks array
        tasks = tasks.filter(t => t.name !== task.name);

        // Update localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Remove from DOM
        row.remove();
    }

    function scheduleTask(task) {
        const now = new Date();
        const taskTime = new Date(task.time);

        const delay = taskTime - now;

        if (delay > 0) {
            setTimeout(() => {
                // Check dependency
                if (task.dependency) {
                    const dependencyTask = tasks.find(t => t.name === task.dependency);

                    if (dependencyTask && dependencyTask.status !== 'Done') {
                        // Wait until dependency is done
                        const checkDependencyInterval = setInterval(() => {
                            if (dependencyTask.status === 'Done') {
                                clearInterval(checkDependencyInterval);
                                startTask(task);
                            }
                        }, 1000);
                    } else {
                        startTask(task);
                    }
                } else {
                    startTask(task);
                }
            }, delay);
        } else {
            // Time has passed; you might want to handle this case
        }
    }

    function startTask(task) {
        // Update status to 'Running'
        task.status = 'Running';
        updateTaskInDOMAndStorage(task);

        // Show notification
        showNotification(`Task '${task.name}' has started.`);

        // Execute task for specified duration
        setTimeout(() => {
            // Update status to 'Done'
            task.status = 'Done';
            updateTaskInDOMAndStorage(task);

            // Show notification
            showNotification(`Task '${task.name}' is done.`);
        }, task.duration * 1000);
    }

    function showNotification(message) {
        // Show pop-up
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<img src="icon.png" alt="Icon"><span>${message}</span>`;
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Browser Notification
        if (Notification.permission === 'granted') {
            new Notification(message, {
                icon: 'icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(message, {
                        icon: 'icon.png'
                    });
                }
            });
        }
    }

    // Request notification permission on page load
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    loadTasksFromLocalStorage();
});
