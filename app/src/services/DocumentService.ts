
/**
 * The document service encapsulates all backend api calls for performing CRUD operations on document data
 */
export const documentServices = {
    getDocument,
    getDocumentIds
}

function getDocument(firebase:any, project:any, document_id:any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    };
    updateToken(firebase)
   
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents/' + document_id + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.document
        })
}

function getDocumentIds(firebase:any, project:any, page:number, page_size:number) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    };
    updateToken(firebase)
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents'
        + '?id_token=' + localStorage.getItem('user-token')
        + '&page=' + page
        + '&page_size=' + page_size, requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.docs;
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

function updateToken(firebase:any) {
    const token = localStorage.getItem('user-token');
    if(firebase.auth.currentUser != null){
        firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
            if(token !== idToken){
                localStorage.setItem('user-token',idToken)
            }
        })
    } else {
        window.location.href = '/auth';
    }

}