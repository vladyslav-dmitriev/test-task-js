/* Элементы страницы */

const elSortPriority = document.getElementById('sort-priority'),
	  elSortProject = document.getElementById('sort-project'),
	  elFormCancel = document.getElementById('form-btn-cancel'),
	  elAddTask = document.getElementById('add-task'),
	  elForm = document.getElementById('form'),
	  elControlPanel = document.getElementById('control-panel'),
	  formBtnCancel = document.getElementById('form-btn-cancel'),
	  elTasksList = document.getElementById('tasksList'),
	  formTitle = document.getElementById('form-title'),
	  formProject = document.getElementById('form-project'),
	  formPriority = document.getElementById('form-priority'),
	  formDescription = document.getElementById('form-description'),
	  elMessage = document.getElementById('message');

/* Вспомогательные переменные */

var formEdit = false,
	tasks = localStorage.tasks ? JSON.parse(localStorage.tasks) : [];

/* Вспомогательные функции */

function resetForm() {
	formTitle.value = '';
	formProject.value = '';
	formDescription.value = '';
}

function sortedOfPriority(tasksArray) {
	var listNew = [];
	for (var key in tasksArray) {
	  listNew[key] = tasksArray[key];
	}
	return listNew.sort((a, b) => a.priority > b.priority);
}

function sortedOfProject(selectProject) {
	var listNew = [];
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].project === selectProject) {
			listNew.push(tasks[i]);
		}
	}
	return listNew;
}

/* Класс Задача */

function Task() {};

Task.prototype.validation = function(task) {
	function customValidation(input, minValue, maxValue) {
		return input.length >= minValue && input.length <= maxValue ? true : false;
	}
	return customValidation(task.title, 3, 30) && customValidation(task.project, 3, 30) && customValidation(task.description, 5, 200) ? true : false
}

Task.prototype.addition = function() {
	var task = {
		id: +tasks.length,
		title: formTitle.value.trim(),
		project: formProject.value.trim(),
		priority: formPriority.value,
		description: formDescription.value.trim()
	}

	if (this.validation(task)) {
		tasks.push(task);
		localStorage.tasks = JSON.stringify(tasks);
		project.addition(task.project);
		resetForm();

		if (elSortProject.selectedIndex === 0) {
			todo.displayAllTasks();
		} else {
			for (var z = 0; z < elSortProject.options.length; z++) {
				if (elSortProject.options[z].value === elSortProject.value) {
					todo.displayAllTasks(elSortProject.value);
					elSortProject.options[z].selected;
					break;
				}
			}
		}
		todo.showControlPanel();
	}
}

Task.prototype.searchProject = function(id) {
	var projectName;
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id === +id) {
			projectName = tasks[i].project;
			break;
		}
	}
	return projectName;
}

Task.prototype.edit = function(id) {
	var task;
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].id === +id) {
			task = tasks[i];
			break;
		}
	}

	elForm.setAttribute('data-id', task.id);
	formTitle.value = task.title;
	formProject.value = task.project;
	formPriority.value = task.priority;
	formDescription.value = task.description;
}

Task.prototype.save = function(id) {
	var task = {
		id: +elForm.getAttribute('data-id'),
		title: formTitle.value.trim(),
		project: formProject.value.trim(),
		priority: formPriority.value,
		description: formDescription.value.trim()
	}

	if (this.validation(task)) {
		tasks.splice(task.id, 1, task);
		localStorage.tasks = JSON.stringify(tasks);
		project.addition(task.project);
		resetForm();

		if (elSortProject.selectedIndex === 0) {
			todo.displayAllTasks();
		} else {
			for (var z = 0; z < elSortProject.options.length; z++) {
				if (elSortProject.options[z].value === elSortProject.value) {
					todo.displayAllTasks(elSortProject.value);
					elSortProject.options[z].selected;
					break;
				} else {
					todo.displayAllTasks();
				}
			}
		}
		todo.showControlPanel();
	}
}

Task.prototype.close = function(id) {
	var projectName = this.searchProject(id);
	var counter = project.close(projectName);
	var deleteEl = tasks.splice(id, 1);

	todo.showControlPanel();
	resetForm();

	if (!(tasks.length === 0)) {
		for (var y = 0; y < tasks.length; y++) {
			tasks[y].id = y;
		}
	}

	localStorage.tasks = JSON.stringify(tasks);

	if (counter < 2 || elSortProject.selectedIndex === 0) {
		todo.displayAllTasks();
	} else {
		for (var z = 0; z < elSortProject.options.length; z++) {
			if (elSortProject.options[z].value === elSortProject.value) {
				todo.displayAllTasks(elSortProject.value);
				elSortProject.options[z].selected;
				break;
			}
		}
	}
}

var task = new Task();

/* Класс Проект */

var projects = [];

function Project() {};

Project.prototype.searchProject = function(project) {
	for (var i = 0; i < projects.length; i++) {
		if (projects[i] === project) {
			return i
			break;
		}
	}
}

Project.prototype.addition = function(project) {
	if (this.searchProject(project) === undefined ) {
		projects.push(project);
	}
}

Project.prototype.close = function(project) {
	var counter = 0;
	for (var i = 0; i < tasks.length; i++) {
		if (tasks[i].project === project) {
			counter++;
		}
	}
	if (counter < 2) {
		var index = this.searchProject(project);
		projects.splice(index, 1);
	}
	return counter
}

var project = new Project();

/* Класс Select */

function Select() {};

Select.prototype.createOption = function(projectName, status) {
	var option = new Option(projectName, projectName, status, status);
	elSortProject.appendChild(option);
}

Select.prototype.showAllOptions = function(selectValue) {
	elSortProject.innerHTML = '';
	selectValue === undefined || elSortProject.selectedIndex === 0 || tasks.length === 0 ? this.createOption('Все', true) : this.createOption('Все', false);

	for (var i = 0; i < projects.length; i++) {
		projects[i] === selectValue ? this.createOption(projects[i], true) : this.createOption(projects[i], false);
	}
}

var select = new Select();

/* Класс Todo - инициализация приложения */

function Todo() {};

Todo.prototype.emptyTasksList = function() {
	if (tasks.length === 0) {
		var div = document.createElement('div');
		div.innerHTML = `
			Список задач пуст!
			<br>
			Вы можете написать в консоль todo.addDemoTasks() для добавления демо задач
		`;
		elMessage.appendChild(div);
	} else {
		elMessage.innerHTML = '';
	}
}

Todo.prototype.displayTask = function displayTask(task) {
	var div = document.createElement('div');
	div.className = 'task';
	div.setAttribute('data-id', task.id);
	div.innerHTML = `
		<h3 class="task__title">${task.title}</h3>
		<div class="task__container task__container_info">
		<div class="task__box">
			<div class="task__text">Проект:</div>
			<div class="task__project">${task.project}</div>
		</div>
		<div class="task__box">
			<div class="task__text">Приоритет:</div>
			<div class="task__priority">${task.priority}</div>
		</div>
		</div>
		<div class="task__description">${task.description}</div>
		<div class="task__container task__container_btn">
			<input class="task__edit" type="submit" value="Изменить">
			<input class="task__close" type="submit" value="Закрыть">
			<input class="task__visible" type="submit" value="Развернуть">
		</div>`;
	tasksList.appendChild(div);
}

Todo.prototype.displayAllTasks = function(selectValue) {
	elTasksList.innerHTML = '';
	localStorage.tasks = JSON.stringify(tasks);
	todo.emptyTasksList();
	select.showAllOptions(selectValue);

	var listProjects = selectValue === undefined ? tasks : sortedOfProject(selectValue);
	var list = elSortPriority.checked ? sortedOfPriority(listProjects) : listProjects;

	for (var i = 0; i < list.length; i++) {
		todo.displayTask(list[i]);
	}
}

Todo.prototype.init = function() {
	for (var i = 0; i < tasks.length; i++) {
		project.addition(tasks[i].project);
	}

	this.displayAllTasks();
}

Todo.prototype.addDemoTasks = function() {
	tasks = testTasks;
	this.init();
}

Todo.prototype.showForm = function() {
	elControlPanel.classList.add('hidden');
	elForm.classList.remove('hidden');
}

Todo.prototype.showControlPanel = function() {
	elControlPanel.classList.remove('hidden');
	elForm.classList.add('hidden');

}

var todo = new Todo();
todo.init();

/* Обработчики */

elForm.addEventListener('submit', function(e) {
	e.preventDefault();
	formEdit ? task.save() : task.addition();
});

elTasksList.addEventListener('click', function(e) {
	var target = e.target;
	
	if (target.classList.contains('task__close')) {
		var id = target.closest('.task').getAttribute('data-id');
		task.close(id);
	} else if (target.classList.contains('task__visible')) {
		var id = target.closest('.task').getAttribute('data-id');
		var elTask = target.closest('.task');

		if (!(elTask.classList.contains('task_active'))) {
			elTask.classList.add('task_active');
			target.value = 'Свернуть';
		} else {
			elTask.classList.remove('task_active');
			target.value = 'Развернуть';
		}
	} else if (target.classList.contains('task__edit')) {
		var id = target.closest('.task').getAttribute('data-id');
		task.edit(id);
		formEdit = true;
		todo.showForm();
	}
});

formBtnCancel.addEventListener('click', function() {
	elForm.classList.add('hidden');
});

elSortPriority.addEventListener('click', function() {
	tasks.length === 0 ? true : elSortProject.selectedIndex === 0 ? todo.displayAllTasks() : todo.displayAllTasks(elSortProject.value);
});

elSortProject.addEventListener('change', function() {
	elSortProject.selectedIndex === 0 ? todo.displayAllTasks() : todo.displayAllTasks(this.value);
});

elAddTask.addEventListener('click', function() {
	todo.showForm();
	formEdit = false;
});

elFormCancel.addEventListener('click', function() {
	todo.showControlPanel();
});

/* Демо задачи */

var testTasks = [
	{	id: 0,
		title: 'Задача 1',
		project: 'Проект 1',
		priority: 1,
		description: 'Описание 1'
	},
	{	
		id: 1,
		title: 'Задача 2',
		project: 'Проект 2',
		priority: 3,
		description: 'Описание 2'
	},
	{
		id: 2,
		title: 'Задача 3',
		project: 'Проект 3',
		priority: 2,
		description: 'Описание 3'
	},
	{
		id: 3,
		title: 'Задача 4',
		project: 'Проект 2',
		priority: 4,
		description: 'Описание 4'
	}
];