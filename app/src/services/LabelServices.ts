
/**
 * The document service encapsulates all backend api calls for performing CRUD operations on document data
 */
export const labelServices = {
    getLabels,
    setLabels,
    updateLabel,
    updateConfirmedLabel
}

async function getLabels(project_name: any, firebase:any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    };

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
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_name + '/labels/all' + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.labels
        })
 }

function setLabels(project: string, label_name: string, firebase:any) {
    const requestOptions = {
        method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ label_name })
     };

     const token = localStorage.getItem('user-token');
     if (firebase.auth.currentUser != null) {
         firebase.auth.currentUser.getIdToken().then((idToken: string) => {
             if (token !== idToken) {
                 localStorage.setItem('user-token', idToken)
             }
         })
     } else {
         window.location.href = '/auth';
     }

    return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/labels/add' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

function updateLabel(project: string, label_id: number, label_name: string, firebase: any){
    const requestOptions = {
        method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ label_name })
     };

     const token = localStorage.getItem('user-token');
     if (firebase.auth.currentUser != null) {
         firebase.auth.currentUser.getIdToken().then((idToken: string) => {
             if (token !== idToken) {
                 localStorage.setItem('user-token', idToken)
             }
         })
     } else {
         window.location.href = '/auth';
     }

    return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/labels/' + label_id + '/update' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
}


function updateConfirmedLabel(project: string, document_id: string, label_id: number,  firebase: any){
    const requestOptions = {
        method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ label_id })
     };

     const token = localStorage.getItem('user-token');
     if (firebase.auth.currentUser != null) {
         firebase.auth.currentUser.getIdToken().then((idToken: string) => {
             if (token !== idToken) {
                 localStorage.setItem('user-token', idToken)
             }
         })
     } else {
         window.location.href = '/auth';
     }

    return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/documents/' + document_id + '/label-confirmation' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data
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