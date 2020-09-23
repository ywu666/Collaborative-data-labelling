
/**
 * The document service encapsulates all backend api calls for performing CRUD operations on document data
 */
export const documentServices = {
    getDocument,
    getDocumentIds
}

function getDocument(project:any, document_id:any) {
   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
   };
   
   return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents/' + document_id + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
       .then(handleResponse)
       .then(data => {
           console.log(data)
           return data.document
       })
}

function getDocumentIds(project:any) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/documents' + '?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
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