const addTodoBtn = document.querySelector('#add-todo_btn');
const newTodoInput = document.querySelector('#todo-input');
const deleteTodoBtn = document.querySelector('#delete-todo_btn');
const editTodoBtn = document.querySelector('#edit-todo_btn');
const saveTodoBtn = document.querySelector('#save-todo_btn');
const todoContainer = document.querySelector('#todo-list_container');
// const checkBoxes = document.querySelectorAll('#todo-checkbox');


addTodoBtn.addEventListener('click', () => {
    appendTodoBox(newTodoInput.value);
    newTodoInput.value = "";
});

function appendTodoBox(newTodoContent) {
    const timeStampAsId = Date.now();
    appendHTML(timeStampAsId, newTodoContent, false);
    const currentTodoBox = todoContainer.lastElementChild;
    const newTodoObject = createToDoObject(currentTodoBox);
    writeTodotoLocalStorage(newTodoObject);
    renderTodoList(getTodosArray());
}

function appendHTML(id, todoContent, taskDone) {
    todoContainer.innerHTML += `
        <div class="todo-box mb-3 d-flex justify-content-center align-items-center" todoId=${id} >
            <div class="todo-content d-flex gap-1">
                <div class="input-group m-auto">
                    <div class="input-group-text check-box"><input id="todo-checkbox" class="form-check-input" type="checkbox"
                        id="checkboxNoLabel" value="" ${taskDone ? 'checked' : ""} ></div>
                    
                    <input id="todo-text" type="text" class="form-control" value="${todoContent}" disabled>
                </div>
                <button id="save-todo_btn" type="button" class="btn btn-success d-none">儲存</button>
                <button id="edit-todo_btn" type="button" class="btn btn-warning">編輯</button>
                <button id="delete-todo_btn" type="button" class="btn btn-danger">刪除</button>
            </div>
        </div >
        `
}


function renderTodoList(todosArray) {
    todoContainer.innerHTML = "";
    todosArray.forEach((todo) => appendHTML(todo.id, todo.todoContent, todo.taskDone));
}

window.addEventListener('load', () => {
    const todosArray = getTodosArray();
    renderTodoList(todosArray);
})


todoContainer.addEventListener('click', (e) => {
    removeTodoBox(e.target);
    editTodo(e.target);
    saveTodo(e.target);
})

todoContainer.addEventListener('change', (e) => {
    handleCheckBoxChange(e.target);
})


const removeTodoBox = (targetElement) => {
    if (targetElement.matches('#delete-todo_btn')) {
        const parentTodoBox = targetElement.closest('.todo-box');
        parentTodoBox.remove();
        removeTodoFromLocalStorage(parentTodoBox.getAttribute('todoId'));
    }
}

function editTodo(targetElement) {
    if (targetElement.matches('#edit-todo_btn')) {
        const textArea = targetElement.parentNode.querySelector('#todo-text');
        textArea.removeAttribute('disabled');
        targetElement.classList.add('d-none');
        targetElement.previousElementSibling.classList.remove('d-none');
    }
}

function saveTodo(targetElement) {
    if (targetElement.matches('#save-todo_btn')) {
        const textArea = targetElement.parentNode.querySelector('#todo-text');
        textArea.setAttribute('disabled', true);
        targetElement.classList.add('d-none');
        targetElement.nextElementSibling.classList.remove('d-none');
        const parentTodoBoxId = targetElement.closest('.todo-box').getAttribute('todoId');
        const todoObject = getTodoObjectById(parentTodoBoxId);
        todoObject.todoContent = textArea.value;
        updateLocalStorage(parentTodoBoxId, todoObject);
    }
}


function handleCheckBoxChange(targetElement) {
    if (targetElement.matches('#todo-checkbox')) {
        const parentTodoBoxId = targetElement.closest('.todo-box').getAttribute('todoId');
        const todoObject = getTodoObjectById(parentTodoBoxId);
        todoObject.taskDone = !todoObject.taskDone;
        updateLocalStorage(parentTodoBoxId, todoObject);
    }
}


function createToDoObject(todoBoxElement) {
    const id = todoBoxElement.getAttribute('todoId');
    const todoContent = todoBoxElement.querySelector('#todo-text').value;
    return {
        id: id,
        todoContent: todoContent,
        taskDone: false
    }
}


function writeTodotoLocalStorage(newTodoObject) {
    const todosArray = getTodosArray();
    todosArray.push(newTodoObject);
    localStorage.setItem('todos', JSON.stringify(todosArray));
}

function updateLocalStorage(todoId, newTodoObject) {
    const todosArray = getTodosArray();
    const targetTodoIndex = todosArray.findIndex((todo) => todo.id === todoId);
    todosArray.splice(targetTodoIndex, 1, newTodoObject);
    localStorage.setItem('todos', JSON.stringify(todosArray));
}


function removeTodoFromLocalStorage(todoId) {
    const todosArray = getTodosArray();
    const targetTodoIndex = todosArray.findIndex((todo) => todo.id === todoId);
    todosArray.splice(targetTodoIndex, 1);
    localStorage.setItem('todos', JSON.stringify(todosArray));
}


function getTodoObjectById(id) {
    const todosArray = getTodosArray();
    return todosArray.find((todo) => todo.id === id);
}

function getTodosArray() {
    const todos = localStorage.getItem('todos');
    return todos ? JSON.parse(todos) : [];
}

