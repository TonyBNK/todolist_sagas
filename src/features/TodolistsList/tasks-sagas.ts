import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";
import {
    GetTasksResponse,
    ResponseType,
    todolistsAPI
} from "../../api/todolists-api";
import {removeTaskAC, setTasksAC} from "./tasks-reducer";

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
})

export function* tasksWatcherSaga() {
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksWorkerSaga);
    yield takeEvery('TASKS/REMOVE-TASK', removeTaskWorkerSaga);
}
