import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {todolistsAPI} from "../../api/todolists-api";
import {handleServerNetworkError} from "../../utils/error-utils";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC, removeTodolistAC,
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
})

export function* todolistsWatcherSaga() {
    yield takeEvery('TODOLISTS/FETCH-TODOLISTS', fetchTodolistsWorkerSaga);
    yield takeEvery('TODOLISTS/REMOVE-TODOLIST', removeTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/ADD-TODOLIST', addTodolistWorkerSaga);
}
