/**
 * The document service encapsulates all backend api calls for performing CRUD operations on document data
 */
export const documentServices = {
    getDocument,
    getDocumentIds,
    postDocumentLabel,
    getLabels,
    postNewComment
}

async function getDocument(project:any, document_id:any, firebase: any) {
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

    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents/' + document_id + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.document
        })
}

async function getDocumentIds(project:any, page:number, page_size:number ,firebase: any) {
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
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents'
        + '?page=' + page
        + '&page_size=' + page_size
        + '&id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.docs;
        })
}

async function postDocumentLabel(project: any, document_id: any, email:any, label_id: any, firebase:any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
        body: JSON.stringify({ email, label_id })
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
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents/' + document_id + '/label'
        + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.docs;
        })
}

async function getLabels(project_name: any, firebase: any) {
   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
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

   return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_name
   + '/labels/all' + '?id_token='
   + localStorage.getItem('user-token'), requestOptions)
       .then(handleResponse)
       .then(data => {

           return data.labels
       })
}

async function postNewComment(project_name: string, document_id: string, comment: string | undefined , firebase: any){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
        body: JSON.stringify({ comment })
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
    
    return fetch(process.env.REACT_APP_API_URL + 
        '/projects/' + project_name + "/documents/" + document_id + "/comments/post?id_token="
        + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return null
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