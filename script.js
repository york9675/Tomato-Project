let storedShowEndTime = localStorage.getItem('showEndTime');
let showEndTime = storedShowEndTime !== null ? JSON.parse(storedShowEndTime) : true;
let timeFormat = localStorage.getItem('timeFormat') || '12';
let currentMode = 'pomodoro';
let notificationsEnabled = localStorage.getItem('notificationsEnabled') !== null 
    ? JSON.parse(localStorage.getItem('notificationsEnabled')) 
    : true;
let alarmSoundEnabled = localStorage.getItem('alarmSoundEnabled') !== null
    ? JSON.parse(localStorage.getItem('alarmSoundEnabled'))
    : true;

let timeRemaining = 25 * 60;
let timerInterval;
let isRunning = false;

const timerDisplay = document.getElementById('timer-display');
const endTimeDisplay = document.getElementById('end-time-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const alarmSound = document.getElementById('alarm-sound');
const customTimeInput = document.getElementById('custom-time-input');
const customModeBtn = document.getElementById('custom-mode-btn');
const customMinutesInput = document.getElementById('custom-minutes');
const customSecondsInput = document.getElementById('custom-seconds');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const toggleEndTime = document.getElementById('toggle-end-time');
const timeFormatSelect = document.getElementById('time-format');
const timeFormatContainer = document.getElementById('time-format-container');
const toggleNotifications = document.getElementById('toggle-notifications');
const grantNotificationBtn = document.getElementById('grant-notification');
const closeSettingsBtn = document.getElementById('close-settings');
const modeTabs = document.querySelectorAll('.mode-tab');
const tabs = document.querySelectorAll('.settings-tab');
const contents = document.querySelectorAll('.settings-content');
const toggleAlarmSound = document.getElementById('toggle-alarm-sound');
const testAlarmButton = document.getElementById('test-alarm');
const pomodoroInfoIcon = document.getElementById('pomodoro-info');
const pomodoroInfoBtn = document.getElementById('pomodoro-info-btn');
const pomodoroInfoModal = document.getElementById('pomodoro-info-modal');
const closePomodoroInfo = document.getElementById('close-pomodoro-info');

function setMode(mode) {
    currentMode = mode;
    modeTabs.forEach(tab => {
        if (tab.dataset.mode === mode) {
            tab.classList.remove(
                'bg-red-100', 'text-red-700', 'hover:bg-red-200',
                'dark:bg-gray-700', 'dark:text-red-300', 'dark:hover:bg-gray-600'
            );
            tab.classList.add('bg-red-500', 'text-white', 'dark:bg-red-700');
        } else {
            tab.classList.remove(
                'bg-red-500', 'text-white', 'dark:bg-red-700'
            );
            tab.classList.add(
                'bg-red-100', 'text-red-700', 'hover:bg-red-200',
                'dark:bg-gray-700', 'dark:text-red-300', 'dark:hover:bg-gray-600'
            );
        }
    });

    switch (mode) {
        case 'pomodoro':
            timeRemaining = 25 * 60;
            break;
        case 'short-break':
            timeRemaining = 5 * 60;
            break;
        case 'long-break':
            timeRemaining = 15 * 60;
            break;
    }
    resetTimer();
}

function updateNotificationUI() {
    if (!notificationsEnabled) {
        grantNotificationBtn.closest('.flex.items-center.justify-between').style.display = 'none';
    } else {
        grantNotificationBtn.closest('.flex.items-center.justify-between').style.display = 'flex';

        if (Notification.permission === "granted") {
            grantNotificationBtn.disabled = false;
            grantNotificationBtn.textContent = 'Test It!';
            grantNotificationBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'dark:bg-blue-700', 'dark:hover:bg-blue-600');
            grantNotificationBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'dark:bg-green-700', 'dark:hover:bg-green-600');
        } else {
            grantNotificationBtn.disabled = false;
            grantNotificationBtn.textContent = 'Grant Permission';
            grantNotificationBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'dark:bg-green-700', 'dark:hover:bg-green-600');
            grantNotificationBtn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'dark:bg-blue-700', 'dark:hover:bg-blue-600');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    toggleEndTime.checked = showEndTime;
    timeFormatSelect.value = timeFormat;
    toggleNotifications.checked = notificationsEnabled;
    toggleAlarmSound.checked = alarmSoundEnabled;
    updateNotificationUI();
    applyShowEndTimeState();
    updateDisplay();
});

pomodoroInfoBtn.addEventListener('click', () => {
    pomodoroInfoModal.classList.remove('hidden');
});

closePomodoroInfo.addEventListener('click', () => {
    pomodoroInfoModal.classList.add('hidden');
});

pomodoroInfoModal.addEventListener('click', (e) => {
    if (e.target === pomodoroInfoModal) {
        pomodoroInfoModal.classList.add('hidden');
    }
});

toggleAlarmSound.addEventListener('change', (e) => {
    alarmSoundEnabled = e.target.checked;
    localStorage.setItem('alarmSoundEnabled', JSON.stringify(alarmSoundEnabled));
});

toggleNotifications.addEventListener('change', (e) => {
    notificationsEnabled = e.target.checked;
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    updateNotificationUI();
});

toggleEndTime.addEventListener('change', (e) => {
    showEndTime = e.target.checked;
    localStorage.setItem('showEndTime', JSON.stringify(showEndTime));
    applyShowEndTimeState();
    updateDisplay();
});

timeFormatSelect.addEventListener('change', (e) => {
    timeFormat = e.target.value;
    localStorage.setItem('timeFormat', timeFormat);
    updateDisplay();
});

function applyShowEndTimeState() {
    if (showEndTime) {
        timeFormatContainer.style.display = 'block';
    } else {
        timeFormatContainer.style.display = 'none';
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('bg-gray-300', 'dark:bg-gray-600');
            t.classList.add('hover:bg-gray-300', 'dark:hover:bg-gray-600');
        });

        tab.classList.add('bg-gray-300', 'dark:bg-gray-600');
        tab.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');

        contents.forEach(content => content.classList.add('hidden'));

        let target;
        switch(tab.id) {
            case 'tab-general':
                target = 'general-settings';
                break;
            case 'tab-alert':
                target = 'alert-settings';
                break;
            case 'tab-about':
                target = 'about-settings';
                break;
            case 'tab-todo':
                target = 'todo-settings';
                break;
        }
        document.getElementById(target).classList.remove('hidden');
    });
});

settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
});

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = displayTime;
    document.title = `${displayTime} - Tomato Project`;

    if (showEndTime && isRunning) {
        const now = new Date();
        now.setSeconds(now.getSeconds() + timeRemaining);
        const hours = now.getHours();
        const mins = now.getMinutes();
        const formattedTime = timeFormat === '12'
            ? `${(hours % 12 || 12)}:${mins.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
            : `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        endTimeDisplay.textContent = `⌛ ${formattedTime}`;
    } else {
        endTimeDisplay.textContent = '';
    }
}

function startPauseTimer() {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        startPauseBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        startPauseBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');

        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                if (alarmSoundEnabled) {
                    alarmSound.play();
                }
                showNotification();
                isRunning = false;
                startPauseBtn.textContent = 'Start';
                startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            }
        }, 1000);
        updateDisplay();
    }
}

testAlarmButton.addEventListener('click', () => {
    if (alarmSound.paused) {
        alarmSound.currentTime = 0; // Reset playback to the beginning
        alarmSound.play().catch((error) => {
            console.error("Error playing the alarm sound:", error);
        });
    } else {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
});

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    updateDisplay();
}

function setCustomTime() {
    const minutes = parseInt(customMinutesInput.value) || 0;
    const seconds = parseInt(customSecondsInput.value) || 0;
    timeRemaining = (minutes * 60) + seconds;
    resetTimer();
    customTimeInput.classList.add('hidden');
}

modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        setMode(tab.dataset.mode);
    });
});

startPauseBtn.addEventListener('click', startPauseTimer);
    
resetBtn.addEventListener('click', () => {
    if (isRunning || timeRemaining !== getCurrentDefaultTime()) {
        showResetConfirmation();
    } else {
        resetTimerToDefault();
    }
});

function getCurrentDefaultTime() {
    if (customTimeInput.classList.contains('hidden') === false) {
        const minutes = parseInt(customMinutesInput.value) || 0;
        const seconds = parseInt(customSecondsInput.value) || 0;
        return (minutes * 60) + seconds;
    }

    switch(currentMode) {
        case 'pomodoro':
            return 25 * 60;
        case 'short-break':
            return 5 * 60;
        case 'long-break':
            return 15 * 60;
        default:
            return 25 * 60;
    }
}

function resetTimerToDefault() {
    timeRemaining = getCurrentDefaultTime();
    resetTimer();
}

function showResetConfirmation() {
    document.getElementById('reset-confirm-modal').classList.remove('hidden');
}

function hideResetConfirmation() {
    document.getElementById('reset-confirm-modal').classList.add('hidden');
}

document.getElementById('reset-confirm-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('reset-confirm-modal')) {
        hideResetConfirmation();
    }
});

document.getElementById('cancel-reset').addEventListener('click', hideResetConfirmation);

document.getElementById('confirm-reset').addEventListener('click', () => {
    resetTimerToDefault();
    hideResetConfirmation();
});

customModeBtn.addEventListener('click', () => {
    customTimeInput.classList.toggle('hidden');
});

customMinutesInput.addEventListener('change', () => {
    const minutes = parseInt(customMinutesInput.value) || 0;
    customMinutesInput.value = Math.min(Math.max(minutes, 0), 60);
});

customSecondsInput.addEventListener('change', () => {
    const seconds = parseInt(customSecondsInput.value) || 0;
    customSecondsInput.value = Math.min(Math.max(seconds, 0), 59);
});

customMinutesInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        setCustomTime();
    }
});

customSecondsInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        setCustomTime();
    }
});

customModeBtn.addEventListener('dblclick', setCustomTime);

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
});

grantNotificationBtn.addEventListener('click', () => {
    if (Notification.permission === 'granted') {
        new Notification('🍅 Tomato Project', {
            body: 'Notification permission granted! 🎉',
        });
    } else {
        requestNotificationPermission();
    }
});

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                alert("Notifications enabled!");
                grantNotificationBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'dark:bg-blue-700', 'dark:hover:bg-blue-600');
                grantNotificationBtn.classList.add('text-white', 'dark:bg-green-700', 'dark:hover:bg-green-600', 'cursor-not-allowed');
                grantNotificationBtn.textContent = 'Granted';
            }
        });
    }
}

function showNotification() {
    if (notificationsEnabled && Notification.permission === "granted") {
        new Notification("🍅 Tomato Project Timer", {
            body: "Your timer has finished!",
        });
    }
}

updateDisplay();

// MARK: -Todo list elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoNoteInput = document.getElementById('todo-note-input');
const todoList = document.getElementById('todo-list');

const todoSection = document.getElementById('todo-section');
const toggleTodoList = document.getElementById('toggle-todo-list');

let showTodoList = localStorage.getItem('showTodoList') !== null 
    ? JSON.parse(localStorage.getItem('showTodoList')) 
    : true;

toggleTodoList.checked = showTodoList;
todoSection.style.display = showTodoList ? 'block' : 'none';

toggleTodoList.addEventListener('change', (e) => {
    showTodoList = e.target.checked;
    localStorage.setItem('showTodoList', JSON.stringify(showTodoList));
    todoSection.style.display = showTodoList ? 'block' : 'none';
});


let todos = JSON.parse(localStorage.getItem('todos')) || [];

function showDeleteConfirmation(index) {
    const deleteModal = document.getElementById('todo-delete-modal');
    deleteModal.classList.remove('hidden');

    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');

    function removeListeners() {
        confirmDeleteBtn.removeEventListener('click', confirmHandler);
        cancelDeleteBtn.removeEventListener('click', cancelHandler);
        deleteModal.removeEventListener('click', outsideClickHandler);
    }

    function confirmHandler() {
        deleteTodo(index);
        deleteModal.classList.add('hidden');
        removeListeners();
    }

    function cancelHandler() {
        deleteModal.classList.add('hidden');
        removeListeners();
    }

    function outsideClickHandler(e) {
        if (e.target === deleteModal) {
            deleteModal.classList.add('hidden');
            removeListeners();
        }
    }

    confirmDeleteBtn.addEventListener('click', confirmHandler);
    cancelDeleteBtn.addEventListener('click', cancelHandler);
    deleteModal.addEventListener('click', outsideClickHandler);
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.className = 'flex flex-col p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 shadow-sm draggable';
        todoItem.draggable = true;
        todoItem.dataset.index = index;

        const todoHeader = document.createElement('div');
        todoHeader.className = 'flex items-center justify-between mb-2';

        const reorderHandle = document.createElement('button');
        reorderHandle.innerHTML = '☰';
        reorderHandle.className = 'cursor-move text-gray-500 dark:text-gray-400 mr-2 hover:text-gray-700';
        reorderHandle.title = 'Drag to reorder';

        const todoText = document.createElement('span');
        todoText.textContent = todo.text;
        todoText.className = `flex-grow text-lg ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`;
        
        const actionContainer = document.createElement('div');
        actionContainer.className = 'flex items-center space-x-2';
        
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.className = 'text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600';
        editBtn.addEventListener('click', () => openEditModal(index));
        
        const completeBtn = document.createElement('button');
        completeBtn.textContent = todo.completed ? 'Undo' : '✓';
        completeBtn.className = `px-3 py-1 ${todo.completed 
            ? 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400' 
            : 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600'} 
            rounded-lg transition`;
        completeBtn.addEventListener('click', () => toggleComplete(index));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.className = 'text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-600';
        deleteBtn.addEventListener('click', () => showDeleteConfirmation(index));
        
        todoHeader.append(reorderHandle, todoText, actionContainer);
        actionContainer.append(editBtn, completeBtn, deleteBtn);
        todoItem.appendChild(todoHeader);

        if (todo.note) {
            const noteSection = document.createElement('div');
            noteSection.textContent = todo.note;
            noteSection.className = 'text-sm text-gray-600 dark:text-gray-400 italic pl-8 whitespace-pre-wrap';
            todoItem.appendChild(noteSection);
        }
        
        todoList.appendChild(todoItem);
    });

    const draggables = document.querySelectorAll('.draggable');
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
        draggable.addEventListener('dragover', dragOver);
        draggable.addEventListener('drop', drop);
        draggable.addEventListener('dragend', dragEnd);
    });
}

let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    this.style.opacity = '0.5';
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        const draggedIndex = parseInt(draggedItem.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        const [removedTodo] = todos.splice(draggedIndex, 1);
        todos.splice(targetIndex, 0, removedTodo);

        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }
}

function dragEnd() {
    this.style.opacity = '1';
    draggedItem = null;
}

function openEditModal(index) {
    const todo = todos[index];
    const editModal = document.getElementById('todo-edit-modal');
    const editInput = document.getElementById('edit-todo-input');
    const editNoteInput = document.getElementById('edit-todo-note-input');
    
    editInput.value = todo.text;
    editNoteInput.value = todo.note || '';
    
    editModal.classList.remove('hidden');
    
    const cancelEditBtn = document.getElementById('cancel-edit');
    const todoEditForm = document.getElementById('todo-edit-form');
    
    function removeListeners() {
        todoEditForm.removeEventListener('submit', submitHandler);
        cancelEditBtn.removeEventListener('click', cancelHandler);
    }
    
    function submitHandler(e) {
        e.preventDefault();
        const newText = editInput.value.trim();
        const newNote = editNoteInput.value.trim();
        
        if (newText) {
            todos[index].text = newText;
            todos[index].note = newNote;
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
            editModal.classList.add('hidden');
            removeListeners();
        }
    }
    
    function cancelHandler() {
        editModal.classList.add('hidden');
        removeListeners();
    }
    
    todoEditForm.addEventListener('submit', submitHandler);
    cancelEditBtn.addEventListener('click', cancelHandler);
}

function addTodo(e) {
    e.preventDefault();
    const newTodo = {
        text: todoInput.value.trim(),
        note: todoNoteInput.value.trim(),
        completed: false,
    };

    const activeTasksIndex = todos.findIndex(todo => todo.completed);
    const insertIndex = activeTasksIndex !== -1 ? activeTasksIndex : todos.length;

    todos.splice(insertIndex, 0, newTodo);
    localStorage.setItem('todos', JSON.stringify(todos));

    document.getElementById('todo-input-container').classList.add('hidden');
    renderTodos();
}

function toggleComplete(index) {
    const todo = todos[index];
    todo.completed = !todo.completed;

    todos.splice(index, 1);

    if (todo.completed) {
        todos.push(todo);
    } else {
        const firstCompletedIndex = todos.findIndex(t => t.completed);
        const insertIndex = firstCompletedIndex !== -1 ? firstCompletedIndex : 0;
        todos.splice(insertIndex, 0, todo);
    }
    
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

function editTodo(index) {
    const todo = todos[index];
    const newText = prompt('Edit task:', todo.text);
    const newNote = prompt('Edit note:', todo.note || '');
    
    if (newText !== null) {
        todo.text = newText.trim();
        todo.note = newNote ? newNote.trim() : '';
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }
}

function deleteTodo(index) {
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

todoForm.addEventListener('submit', addTodo);

renderTodos();

document.getElementById('add-todo-toggle').addEventListener('click', () => {
    const todoInputContainer = document.getElementById('todo-input-container');
    todoInputContainer.classList.remove('hidden');

    document.getElementById('todo-input').value = '';
    document.getElementById('todo-note-input').value = '';
});

document.getElementById('cancel-add').addEventListener('click', () => {
    document.getElementById('todo-input-container').classList.add('hidden');
});

const todoMenuToggle = document.getElementById('todo-menu-toggle');
const todoMenu = document.getElementById('todo-menu');
const clearCompletedBtn = document.getElementById('clear-completed-tasks');
const deleteAllBtn = document.getElementById('delete-all-tasks');

todoMenuToggle.addEventListener('click', () => {
    todoMenu.classList.toggle('hidden');
});

clearCompletedBtn.addEventListener('click', () => { 
    showClearCompletedConfirmation()
});

deleteAllBtn.addEventListener('click', () => {
    showDeleteAllConfirmation()
});

document.addEventListener('click', (e) => {
    if (!todoMenu.contains(e.target) && !todoMenuToggle.contains(e.target)) {
        todoMenu.classList.add('hidden');
    }
});

function showClearCompletedConfirmation() {
    const clearCompletedModal = document.getElementById('todo-clear-completed-tasks-modal');
    clearCompletedModal.classList.remove('hidden');

    const cancelClearBtn = document.getElementById('cancel-clear-all');
    const confirmClearBtn = document.getElementById('confirm-clear-all');

    function removeListeners() {
        cancelClearBtn.removeEventListener('click', cancelHandler);
        confirmClearBtn.removeEventListener('click', confirmHandler);
        clearCompletedModal.removeEventListener('click', outsideClickHandler);
    }

    function cancelHandler() {
        clearCompletedModal.classList.add('hidden');
        removeListeners();
    }

    function confirmHandler() {
        todos = todos.filter(todo => !todo.completed);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        clearCompletedModal.classList.add('hidden');
        removeListeners();
    }

    function outsideClickHandler(e) {
        if (e.target === clearCompletedModal) {
            clearCompletedModal.classList.add('hidden');
            removeListeners();
        }
    }

    cancelClearBtn.addEventListener('click', cancelHandler);
    confirmClearBtn.addEventListener('click', confirmHandler);
    clearCompletedModal.addEventListener('click', outsideClickHandler);
}

function showDeleteAllConfirmation() {
    const deleteAllModal = document.getElementById('todo-delete-all-modal');
    deleteAllModal.classList.remove('hidden');

    const cancelDeleteAllBtn = document.getElementById('cancel-delete-all');
    const confirmDeleteAllBtn = document.getElementById('confirm-delete-all');

    function removeListeners() {
        cancelDeleteAllBtn.removeEventListener('click', cancelHandler);
        confirmDeleteAllBtn.removeEventListener('click', confirmHandler);
        deleteAllModal.removeEventListener('click', outsideClickHandler);
    }

    function cancelHandler() {
        deleteAllModal.classList.add('hidden');
        removeListeners();
    }

    function confirmHandler() {
        todos = [];
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        deleteAllModal.classList.add('hidden');
        removeListeners();
    }

    function outsideClickHandler(e) {
        if (e.target === deleteAllModal) {
            deleteAllModal.classList.add('hidden');
            removeListeners();
        }
    }

    cancelDeleteAllBtn.addEventListener('click', cancelHandler);
    confirmDeleteAllBtn.addEventListener('click', confirmHandler);
    deleteAllModal.addEventListener('click', outsideClickHandler);
}
