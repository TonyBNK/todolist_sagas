import {call, put, takeEvery, select} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";
import {
    GetTasksResponse,
    ResponseType, TaskType,
    todolistsAPI, UpdateTaskModelType
} from "../../api/todolists-api";
import {
    addTaskAC,
    removeTaskAC,
    setTasksAC,
    UpdateDomainTaskModelType, updateTaskAC
} from "./tasks-reducer";
import {
    handleServerAppError,
    handleServerNetworkError
} from "../../utils/error-utils";

export function* fetchTasksWorkerSaga(action: ReturnType<typeof fetchTasks>) {
    yield put(setAppStatusAC('loading'));
    const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, action.todolistId);
    const tasks = res.data.items;
    yield put(setTasksAC(tasks, action.todolistId));
    yield put(setAppStatusAC('succeeded'));
}

export const fetchTasks = (todolistId: string) => ({
    type: 'TASKS/FETCH-TASKS',
    todolistId
});

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTask>) {
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId);
    if (res.status === 200) {
        yield put(removeTaskAC(action.taskId, action.todolistId));
    }
}

export const removeTask = (todolistId: string, taskId: string) => ({
    type: 'TASKS/REMOVE-TASK',
    todolistId,
    taskId
});

export function* addTaskWorkerSaga(action: ReturnType<typeof addTask>) {
    try {
        yield put(setAppStatusAC('loading'));
        const res: AxiosResponse<ResponseType<{ item: TaskType}>> = yield call(todolistsAPI.createTask, action.todolistId, action.title);
        if (res.data.resultCode === 0) {
            const task = res.data.data.item
            yield put(addTaskAC(task));
            yield put(setAppStatusAC('succeeded'));
        } else {
            handleServerAppError(res.data, yield put);
        }
    } catch (error) {
        handleServerNetworkError(error, yield put);
    }
}

export const addTask = (title: string, todolistId: string) => ({
    type: 'TASKS/ADD-TASK',
    todolistId,
    title
});

export function* updateTaskSagaWorker(action: ReturnType<typeof updateTask>) {
    try {
        const state = yield select();
        const task = state.tasks[action.todolistId].find((t: TaskType) => t.id === action.taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...action.domainModel
        }

        const res: AxiosResponse<ResponseType<TaskType>> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel);
        if (res.data.resultCode === 0) {
            yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
        } else {
            handleServerAppError(res.data, yield put);
        }
    } catch (error) {
        handleServerNetworkError(error, yield put);
    }
}

export const updateTask = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => ({
    type: 'TASKS/UPDATE-TASK',
    todolistId,
    taskId,
    domainModel
})

export function* tasksWatcherSaga() {
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksWorkerSaga);
    yield takeEvery('TASKS/REMOVE-TASK', removeTaskWorkerSaga);
    yield takeEvery('TASKS/ADD-TASK', addTaskWorkerSaga);
    yield takeEvery('TASKS/UPDATE-TASK', updateTaskSagaWorker);
}
