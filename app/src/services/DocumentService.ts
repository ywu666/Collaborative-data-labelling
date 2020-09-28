
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

function getDocument(project:any, document_id:any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    };
   
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents/' + document_id + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.document
        })
}



function getDocumentIds(project:any, page:number, page_size:number) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    };
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents'
        + '?page=' + page
        + '&page_size=' + page_size
        + '&id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.docs;
        })
}

function postDocumentLabel(project: any, document_id: any, email:any, label_id: any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
        body: JSON.stringify({ email, label_id })
    };
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents/' + document_id + '/label'
        + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data.docs;
        })
}

function getLabels(project_name: any, firebase: any) {
   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
   };
   return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_name
   + '/labels/all' + '?id_token='
   + localStorage.getItem('user-token'), requestOptions)
       .then(handleResponse)
       .then(data => {

           return data.labels
       })
}

function getComments(project_name:string, document_id:string){
    
}

function postNewComment(project_name: string, document_id: string, comment: string | undefined){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
        body: JSON.stringify({ comment })
    };
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