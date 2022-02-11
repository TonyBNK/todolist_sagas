import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {
    handleServerAppError,
    handleServerNetworkError
} from "../../utils/error-utils";
import {setIsLoggedInAC} from "./auth-reducer";

export function* loginWorkerSaga(action: ReturnType<typeof login>) {
    try {
        yield put(setAppStatusAC('loading'));
        const res = yield call(authAPI.login, action.data);
        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(true));
            yield put(setAppStatusAC('succeeded'));
        } else {
            handleServerAppError(res.data, yield put);
        }
    } catch (error) {
        handleServerNetworkError(error, yield put);
    }
}

export const login = (data: LoginParamsType) => ({
    type: 'AUTH/LOG-IN',
    data
});

export function* logoutWorkerSaga() {
    try {
        const res = yield call(authAPI.logout);
        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(false))
            yield put(setAppStatusAC('succeeded'));
        } else {
            handleServerAppError(res.data, yield put);
        }
    } catch (error) {
        handleServerNetworkError(error, yield put);
    }
}

export const logout = () => ({
    type: 'AUTH/LOG-OUT'
});

export function* authWatcherSaga() {
    yield takeEvery('AUTH/LOG-IN', loginWorkerSaga);
    yield takeEvery('AUTH/LOG-OUT', logoutWorkerSaga);
}
