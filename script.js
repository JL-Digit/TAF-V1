document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');

    // Charger les tâches depuis le stockage local du navigateur
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        // 1. Nettoyer les tâches complétées depuis plus d'une semaine
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        tasks = tasks.filter(task => {
            if (!task.completed) return true;
            return new Date(task.completionDate) > oneWeekAgo;
        });

        // 2. Calculer la priorité et trier la liste
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Pour comparer les dates sans l'heure

        tasks.sort((a, b) => {
            // Mettre les tâches complétées à la fin
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // Pour les tâches non complétées, trier par date limite
            const deadlineA = a.deadline ? new Date(a.deadline) : Infinity;
            const deadlineB = b.deadline ? new Date(b.deadline) : Infinity;
            return deadlineA - deadlineB;
        });

        // 3. Afficher les tâches
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) {
                li.classList.add('completed');
            }

            const daysRemaining = task.deadline ? Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24)) : null;

            let priorityClass = 'priority-default';
            let priorityText = 'Aucune';
            if (daysRemaining !== null && !task.completed) {
                if (daysRemaining <= 2) {
                    priorityClass = 'priority-haute';
                    priorityText = 'Haute';
                } else if (daysRemaining <= 7) {
                    priorityClass = 'priority-moyenne';
                    priorityText = 'Moyenne';
                } else {
                    priorityClass = 'priority-basse';
                    priorityText = 'Basse';
                }
            }
            
            li.innerHTML = `
                <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-details">
                        ${task.deadline ? `Pour le : ${new Date(task.deadline).toLocaleDateString('fr-FR')}` : 'Pas de date limite'}
                    </div>
                </div>
                <span class="priority-level ${priorityClass}">${priorityText}</span>
            `;
            taskList.appendChild(li);
        });

        saveTasks();
    };

    const addTask = () => {
        const text = taskInput.value.trim();
        const deadline = deadlineInput.value;

        if (text === '') {
            alert('Veuillez entrer une description pour la tâche.');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            deadline: deadline || null,
            completed: false,
            completionDate: null
        };
        
        // Ajoute la nouvelle tâche au début du tableau (au dessus de la liste)
        tasks.unshift(newTask);

        taskInput.value = '';
        deadlineInput.value = '';
        renderTasks();
    };

    const toggleTask = (id) => {
        const taskIndex = tasks.findIndex(t => t.id == id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            tasks[taskIndex].completionDate = tasks[taskIndex].completed ? new Date().toISOString() : null;
            renderTasks();
        }
    };

    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') {
            toggleTask(e.target.dataset.id);
        }
    });

    // Affichage initial au chargement de la page
    renderTasks();
});