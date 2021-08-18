import { handleAuthorization } from './ProjectServices';

/**
 * The document service encapsulates all backend api calls for performing CRUD operations on document data
 */
export const labelServices = {
    getLabels,
    setLabels,
    updateLabel,
    updateConfirmedLabel
}

async function getLabels(project_id: any, firebase:any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization":"Bearer " + token,
    },
  };

  return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id + '/labels/all', requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
      return data.labels
    })
 }

async function setLabels(project: string, label_name: string, firebase:any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
        method: 'POST',
         headers: {
          'Content-Type': 'application/json',
           "Authorization":"Bearer " + token,
         },
         body: JSON.stringify({ label_name })
     };

  return fetch(process.env.REACT_APP_API_URL +
    '/projects/' + project + '/labels/add', requestOptions)
    .then(handleResponse)
    .then(data => {
      return data.users
    })
 }

async function updateLabel(project: string, label_id: number, label_name: string, firebase: any){
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
        method: 'PUT',
         headers: {
          'Content-Type': 'application/json',
           "Authorization":"Bearer " + token,
         },
         body: JSON.stringify({ label_name })
     };


  return fetch(process.env.REACT_APP_API_URL +
    '/projects/' + project + '/labels/' + label_id + '/update', requestOptions)
    .then(handleResponse)
    .then(data => {
      return data.users
    })
}


async function updateConfirmedLabel(project: string, document_id: string, label_id: number,  firebase: any){
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
        method: 'PUT',
         headers: {
          'Content-Type': 'application/json',
           "Authorization":"Bearer " + token,
         },
         body: JSON.stringify({ label_id })
     };

  return fetch(process.env.REACT_APP_API_URL +
    '/projects/' + project + '/documents/' + document_id + '/label-confirmation', requestOptions)
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