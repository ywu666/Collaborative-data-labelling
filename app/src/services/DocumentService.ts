import { DH_UNABLE_TO_CHECK_GENERATOR } from "constants";
import { EncryptedHelpers } from '../helpers/encryption';
import { handleAuthorization, projectServices } from '../services/ProjectServices';


/**
 * The document service encapsulates all backend api calls for performing CRUD operations on document data
 */
export const documentServices = {
  getDocument,
  getDocumentIds,
  postDocumentLabel,
  getLabels,
  getUnlabelledDocuments,
  postNewComment,
  getNumberOfUnlabelledDocs,
  getUnconfirmedDocuments,
  getIfCurrentUserConfirmedLabel,
}

async function getDocument(projectId:any, documentIndex:any, firebase: any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
  };

  const response = await fetch(process.env.REACT_APP_API_URL + '/projects/' + projectId + '/documents/' + documentIndex, requestOptions) // TODO:config.apiUrl
  const res= await handleResponse(response);
  const decrypt = await EncryptedHelpers.decryptOneData(projectId, res.data, firebase);
  res.data = decrypt;
  return res;

}

async function getDocumentIds(projectId:any, page:number, page_size:number ,firebase: any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
  };

  const response = await fetch(process.env.REACT_APP_API_URL + '/projects/' + projectId + '/documents'
    + '?page=' + page
    + '&page_size=' + page_size, requestOptions);

  const data = await handleResponse(response)

  // decrypt the data if the data is encrypted
  const projectInfo = await projectServices.getDescriptionOfAProject(firebase, projectId)
  const result = await decryptProjectData(projectInfo.encryption_state,data,projectId,firebase);
  return result
}

async function getUnlabelledDocuments(project_id:any, page:number, page_size:number, encryptStatus:boolean,firebase:any) {
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
  };

  const response = await fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id + '/unlabelled/documents'
    + '?page=' + page
    + '&page_size=' + page_size, requestOptions) // TODO:config.apiUrl

  const data = await handleResponse(response);

  // decrypt the data if the data is encrypted
  const result = await decryptProjectData(encryptStatus,data,project_id,firebase);
  return result
}

async function getUnconfirmedDocuments(project_id: any, page: any, page_size: any, encryptStatus:boolean, firebase:any) {
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
  };

  const response = await fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id + '/unconfirmed/documents'
    + '?page=' + page
    + '&page_size=' + page_size, requestOptions)

  const data = await handleResponse(response)

  // decrypt the data if the data is encrypted
  const result = await decryptProjectData(encryptStatus,data,project_id,firebase);
  return result
}

async function postDocumentLabel(project_id: any, document_index: any, email:any, label: any, firebase:any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'POST',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    body: JSON.stringify({ 'label': label })
  };

  return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id
    + '/documents/' + document_index + '/label', requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
      return data.docs;
    })
}

async function getLabels(project_id: any, firebase: any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json'
    },
  };


  return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id+ '/labels/all', requestOptions)
    .then(handleResponse)
    .then(data => {
      return data.labels
    })
}

async function postNewComment(project_name: string, document_id: string, email:any, comment: string | undefined , time:any, firebase: any){
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'POST',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    body: JSON.stringify({ email, comment, time })
  };


  return fetch(process.env.REACT_APP_API_URL +
    '/projects/' + project_name + "/documents/" + document_id + "/comments/post", requestOptions)
    .then(handleResponse)
    .then(data => {
      return null
    })
}

async function getNumberOfUnlabelledDocs(projectId:any, firebase: any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
  };

  return fetch(process.env.REACT_APP_API_URL + '/projects/' + projectId + '/unlabelled/contributors'
    , requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
      return data.contributors;
    })
}

async function getIfCurrentUserConfirmedLabel(project: any, document_id: any, firebase: any){
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: {
      "Authorization":"Bearer " + token,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
  };


  return fetch(process.env.REACT_APP_API_URL + '/projects/' + project +
    '/documents/' + document_id + "/label-is-confirmed", requestOptions)
    .then(handleResponse)
    .then(data => {
      return data.labelIsConfirmed;
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

async function decryptProjectData(encryptStatus:boolean,data:any,projectId:string,firebase:any) {
  if(encryptStatus && data.docs.length > 0) {
    let encryptedData = []
    for (let x in data.docs) {
      encryptedData.push(data.docs[x].data)
    }

    const decryptedData = await EncryptedHelpers.decryptData(projectId, encryptedData,firebase);
    for (let x =0;x<data.docs.length;x++) {
      data.docs[x].data = decryptedData[x]
    }
    return data
  } else {
    return data;
  }
}
