import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {todolistsAPI} from "../../api/todolists-api";
import {handleServerNetworkError} from "../../utils/error-utils";
import {setTodolistsAC} from "./todolists-reducer";

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

export function* todolistsWatcherSaga() {
    yield takeEvery('TODOLISTS/FETCH-TODOLISTS', fetchTodolistsWorkerSaga);
}
