import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {todolistsAPI} from "../../api/todolists-api";
import {handleServerNetworkError} from "../../utils/error-utils";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC, changeTodolistTitleAC, removeTodolistAC,
    setTodolistsAC
} from "./todolists-reducer";

export function* fetchTodolistsWorkerSaga() {
    try {
        yield put(setAppStatusAC('loading'));
        const res = yield call(todolistsAPI.getTodolists);
        yield put(setTodolistsAC(res.data));
        yield put(setAppStatusAC('succeeded'));
    } catch (error) {
        handleServerNetworkError(error, yield put);
    }
}

export const fetchTodolists = () => ({
    type: 'TODOLISTS/FETCH-TODOLISTS'
});

export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolist>) {
    yield put(setAppStatusAC('loading'));
    yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'));
    yield call(todolistsAPI.deleteTodolist, action.todolistId);
    yield put(removeTodolistAC(action.todolistId));
    yield put(setAppStatusAC('succeeded'));
}

export const removeTodolist = (todolistId: string) => ({
    type: 'TODOLISTS/REMOVE-TODOLIST',
    todolistId
});

export function* addTodolistWorkerSaga(action: ReturnType<typeof addTodolist>) {
    yield put(setAppStatusAC('loading'));
    const res = yield call(todolistsAPI.createTodolist, action.title);
    yield put(addTodolistAC(res.data.data.item));
    yield put(setAppStatusAC('succeeded'));
}

export const addTodolist = (title: string) => ({
    type: 'TODOLISTS/ADD-TODOLIST',
    title
});

export function* changeTodolistTitleWorkerSaga(action: ReturnType<typeof changeTodolistTitle>) {
    try {
        const res = yield call(todolistsAPI.updateTodolist, action.id, action.title);
        if (res.status === 200) {
            yield put(changeTodolistTitleAC(action.id, action.title));
        }
    } catch (error) {
        handleServerNetworkError(error, yield put);
    }
}

export const changeTodolistTitle = (id: string, title: string) => ({
    type: 'TODOLISTS/CHANGE-TODOLIST-TITLE',
    id,
    title
});

export function* todolistsWatcherSaga() {
    yield takeEvery('TODOLISTS/FETCH-TODOLISTS', fetchTodolistsWorkerSaga);
    yield takeEvery('TODOLISTS/REMOVE-TODOLIST', removeTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/ADD-TODOLIST', addTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/CHANGE-TODOLIST-TITLE', changeTodolistTitleWorkerSaga);
}
