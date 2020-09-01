import { userService } from "../services/UserServices";
import{history} from '../helpers/history'
import {userConstants} from '../constants/UserConstants'

export const userActions ={
    login,
}

function login(email: any, password: any) {
    return (dispatch: (arg0: any) => void) => {
        dispatch(request({ email }));

        userService.login(email, password)
            .then(
                (                user: any) => { 
                    dispatch(success(user));
                    history.push('/');
                },
                (                error: { toString: () => any; }) => {
                    dispatch(failure(error.toString()));;
                }
            );
    function request(user: { email: any; }) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user: any) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error: any) { return { type: userConstants.LOGIN_FAILURE, error } } 
}
}