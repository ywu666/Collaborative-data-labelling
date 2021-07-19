
/**
 * The user service encapsulates all backend api calls for performing CRUD operations on user data
 */
 export const userService = {
     login,
     getAllUsers,
     getAllUsersInDatabase,
     signup,
     getCurrentProjectUser,
     getCurrentUser,
     getUser
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

function signup(username: string, email: string , token: string, keys:object) {
   const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          "Authorization":"Bearer " + localStorage.getItem('user-token')
        },
        body: JSON.stringify({username, email, keys})
    };

    return fetch(process.env.REACT_APP_API_URL + `/users/create`, requestOptions)
        .then(handleResponse)
        .then(data => {
          console.log('sign up successful!')
        })
}

function getCurrentUser(email: any, firebase: any){
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization":"Bearer " + token
    }};

   if(firebase.auth.currentUser != null){
    firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
        if(token !== idToken){
            localStorage.setItem('user-token',idToken)
        }})
   } else {
    window.location.href = '/auth';
   }

   return fetch(process.env.REACT_APP_API_URL + "/users?email=" + email, requestOptions)
   .then(handleResponse)
}
function getAllUsersInDatabase() {
     const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
 },
    };

    return fetch(process.env.REACT_APP_API_URL + '/user/all'
        + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
}

function getAllUsers(page_num: any, page_size: any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
 },
    };

    return fetch(process.env.REACT_APP_API_URL + '/users/all'
        + '?id_token=' + localStorage.getItem('user-token')
        + '&page=' + page_num
        + '&page_size=' + page_size, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 function getUser(email: any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" 
 },
    };
    
    return fetch(process.env.REACT_APP_API_URL + '/users'
        + '?id_token=' + localStorage.getItem('user-token')
        + '&email=' + email, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.user
        })
 }

function getCurrentProjectUser(project_id: any) {
    const requestOptions = {
        method: 'GET',
        headers: { 
            'Authorization': 'Bearer ' +  localStorage.getItem('user-token'),
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" 
        },
    };

    return fetch(process.env.REACT_APP_API_URL + '/projects/'+ project_id + '/user', requestOptions)
        .then(handleResponse)
        .then(data => {
            return data
        })
}

function handleResponse(response: { text: () => Promise<any>; ok: any; status: number; statusText: any; }) {
    return response.text().then((text: string) => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
              // auto logout if 401 response returned from api
              // remove emailForSignIn from local storage to log user out
              localStorage.removeItem('emailForSignIn');
              //location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}