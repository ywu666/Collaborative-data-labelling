/**
 * The project service encapsulates all backend api calls for performing CRUD operations on project data
 */
export const projectServices = {
    getProjectNames,
    getProjectUsers,
    setProjectUsers,
    getDocument,
    getLabels,
}

async function getProjectNames(firebase: any) {
   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json', 
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
       "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
   };
   await handleAuthorization(firebase);
   const token = localStorage.getItem('user-token');
   if(firebase.auth.currentUser != null){
    firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
        if(token !== idToken){
            localStorage.setItem('user-token',idToken)
        }
       })
   }else{
    window.location.href = '/auth';
   }

   return fetch(process.env.REACT_APP_API_URL + '/projects/all?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl

       .then(handleResponse)
       .then(data => {
           return data.projects
       })
}

async function getProjectUsers(project: string, firebase: any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" }, 
    };

    await handleAuthorization(firebase);
    
    return fetch(process.env.REACT_APP_API_URL + 
        '/projects/' + project + '/users' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 async function setProjectUsers(project: string, user: string, firebase:any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ user })
        };
    
        await handleAuthorization(firebase);

    return fetch(process.env.REACT_APP_API_URL + 
        '/projects/' + project + '/users/add' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 function getDocument(project_name: any, document_id: any, firebase: any) {
     /*const token = localStorage.getItem('user-token');
       if(firebase.auth.currentUser != null){
        firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
            if(token !== idToken){
                localStorage.setItem('user-token',idToken)
            }
           })
       }else{
        window.location.href = '/auth';
       }*/

   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
   };
   return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_name + '/documents/' + document_id + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
       .then(handleResponse)
       .then(data => {

           return data.document
       })
}

function getLabels(project_name: any, firebase: any) {
     /*const token = localStorage.getItem('user-token');
       if(firebase.auth.currentUser != null){
        firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
            if(token !== idToken){
                localStorage.setItem('user-token',idToken)
            }
           })
       }else{
        window.location.href = '/auth';
       }*/

   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
   };
   return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_name + '/labels/all' + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
       .then(handleResponse)
       .then(data => {

           return data.labels
       })
}


function handleResponse(response: { text: () => Promise<any>; ok: any; status: number; statusText: any; }) {
   return response.text().then((text: string) => {
       const data = text && JSON.parse(text);
       if (!response.ok) {
           const error = (data && data.message) || response.statusText;
           return Promise.reject(error);
       }

       return data;
   });
}

export async function handleAuthorization(firebaseAuth: any) {
    const token = localStorage.getItem('user-token');
    if(firebaseAuth.auth.currentUser != null){
        firebaseAuth.auth.currentUser.getIdToken().then((idToken: string) =>{
         if(token !== idToken){
             localStorage.setItem('user-token',idToken)
         }
        })
    }else{
     window.location.href = '/auth';
    }
}
