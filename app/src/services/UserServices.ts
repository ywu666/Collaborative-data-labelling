
/**
 * The user service encapsulates all backend api calls for performing CRUD operations on user data
 */
 export const userService = {
     login,
     logout,
     getAllUsers,
 }

 function logout() {
    // remove emailForSignIn from local storage to log user out
    localStorage.removeItem('emailForSignIn');
}

 function login(email: any, password: any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    };

    return fetch(`/users/authenticate`, requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        });
}

function signup(username: string, email: string,password: string){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    };

    return fetch(process.env.REACT_APP_API_URL + `/users/create`
        , requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
}
function getAllUsers() {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" 
 },
    };
    
    return fetch(process.env.REACT_APP_API_URL + '/users/all' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }


function handleResponse(response: { text: () => Promise<any>; ok: any; status: number; statusText: any; }) {
    return response.text().then((text: string) => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                //location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}