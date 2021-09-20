import { downloadHelpers } from '../helpers/download'
import { EncryptedHelpers} from '../helpers/encryption'
import { EncryptionServices } from './EncryptionService';
import firebase from 'firebase';
/**
 * The project service encapsulates all backend api calls for performing CRUD operations on project data
 */
export const projectServices = {
    getProjectNames,
    exportCsv,
    getProjectUsers,
    getDescriptionOfAProject,
    isProjectEncrypted,
    setProjectUsers,
    setProjectTags,
    setUserPermissions,
    uploadDocuments,
    createProject,
    getProjectAgreementScore,
    addEntryKeyToCollaborator
}

async function createProject(project_name: any, firebase: any, encryption_state:boolean){
  await handleAuthorization(firebase);
  const token = localStorage.getItem('user-token');
  let en_entry_key = ''

  if(encryption_state) {
    //get public key
    const publicKey = localStorage.getItem('public_key')
    if(publicKey == null || publicKey == '') {
      // get from the backend
      const userKey = await EncryptionServices.getUserKeys(firebase)
      localStorage.setItem('public_key', userKey.public_key);
    }

    en_entry_key = await EncryptedHelpers.generateEncryptedEntryKey(localStorage.getItem('public_key'))
  }


  const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
          "Authorization":"Bearer " + token
        },
        body: JSON.stringify( {project_name, encryption_state, en_entry_key} )
    }

    return fetch(process.env.REACT_APP_API_URL + '/projects/create', requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
        return data
    })
}

async function getProjectNames(firebase: any) {
  await handleAuthorization(firebase);
  const token = localStorage.getItem('user-token');
  const requestOptions = {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
       "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
       "Authorization":"Bearer " + token
       }};

   return fetch(process.env.REACT_APP_API_URL + '/projects/all', requestOptions) // TODO:config.apiUrl
       .then(handleResponse)
       .then(data => {
           return data.projects
       })
}

async function getProjectAgreementScore(projectName: any, firebase: any) {
  await handleAuthorization(firebase);
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization":"Bearer " + token
    }};

    return fetch(process.env.REACT_APP_API_URL + '/projects/' + projectName, requestOptions) // TODO:config.apiUrl
        .then(handleResponse)
        .then(data => {
            return data
        })
 }

async function exportCsv(projectName: string, projectId:string, firebase:any,encryptStatus:boolean) {
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=' + projectName + '-export.csv',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Content-Disposition, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization":"Bearer " + token
    },
  };

  const response = fetch(process.env.REACT_APP_API_URL + '/projects/' + projectId +  '/export', requestOptions);
  const data = await handleResponse(await response)

  let exportFields = Object.keys(data['0']);
  if(encryptStatus) {
    for(let i in data) {
      const decryptData = await EncryptedHelpers.decryptOneData(projectId, data[i].DOCUMENT, firebase);
      data[i].DOCUMENT = decryptData;
    }
  }

  const csv = downloadHelpers.collectionToCSV(exportFields, data)
  const blob = new Blob([csv], {type: 'text/csv'});
  downloadHelpers.downloadBlob(blob, projectName + '-export.csv');
}
async function getProjectUsers(project: string, firebase: any, page: number, page_size: number) {
  await handleAuthorization(firebase)
  const token =  localStorage.getItem('user-token')
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization":"Bearer " + token
    },
  };

  return fetch(process.env.REACT_APP_API_URL +
    '/projects/' + project + '/users?page=' + page + '&page_size=' + page_size,
    requestOptions)
    .then(handleResponse)
    .then(data => {
      return data.users
    })

}

async function getDescriptionOfAProject(firebase: any, project_id: any) {
  await handleAuthorization(firebase);
  const token = localStorage.getItem('user-token');
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization": "Bearer " + token
    }
  };

    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.project
        })
}

async function isProjectEncrypted(projectId: string, firebase: any) {
  const projectInfo = await getDescriptionOfAProject(firebase, projectId);
  const encryptStatus = projectInfo.encryption_state;
  return encryptStatus;
}

async function setProjectUsers(project: string, user: string, firebase:any, public_key?: string) {
  let en_entry_key = "";

  if (public_key) {
    // create a new encrypted project entry key for the collaborator 
    const entry_key = await EncryptedHelpers.getEntryKey(project, firebase);
    en_entry_key = await EncryptedHelpers.encryptEntryKey(public_key, entry_key);
  }

  await handleAuthorization(firebase)
  const token =  localStorage.getItem('user-token');
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization":"Bearer " + token
    },
    body: JSON.stringify(
      {
          "user": user,
          "en_entry_key": en_entry_key
      })
  };

  return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/users/add', requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

async function addEntryKeyToCollaborator(project: string, collaboratorEmail: string, firebase:any) {
  const userKey = await EncryptionServices.getUserKeys(firebase, collaboratorEmail);

  const entryKey = await EncryptedHelpers.getEntryKey(project, firebase);
  const enEntryKey = await EncryptedHelpers.encryptEntryKey(userKey.public_key, entryKey);

  await handleAuthorization(firebase)
  const token =  localStorage.getItem('user-token');
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization":"Bearer " + token
    },
    body: JSON.stringify(
      {
          "collaborator": collaboratorEmail,
          "en_entry_key": enEntryKey
      })
  };

  return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/users/entry_key/add', requestOptions)
        .then(handleResponse)
        .then(data => {
            return data
        })
 }

 async function setProjectTags(project: string, label_name: string, firebase:any) {
    const requestOptions = {
        method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ label_name })
     };

    await  handleAuthorization(firebase)

    return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/labels/add' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 async function setUserPermissions(project: string, user: string, isAdmin: boolean, isContributor: boolean, firebase:any) {
    await handleAuthorization(firebase)
    const token = localStorage.getItem('user-token');

    const requestOptions = {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          "Authorization":"Bearer " + token
        },
        body: JSON.stringify(
            {
                "user": user,
                "permissions": { "isAdmin": isAdmin, "isContributor": isContributor }
            })
    };
    
    return fetch(process.env.REACT_APP_API_URL + '/projects/' + project + '/users/update', requestOptions)
        .then(handleResponse)
 }

 async function uploadDocuments(projectId : string, file : File, firebase: any) {
  // check the encryption status of the project
   const project = await getDescriptionOfAProject(firebase, projectId)
   const encryptStatus = project.encryption_state
   const formData = new FormData();
   formData.append("projectId", projectId);

   if(encryptStatus) {
     const encryptedArray = await EncryptedHelpers.encryptData(file, firebase, projectId)
     formData.append('encryptedData', JSON.stringify(encryptedArray));

   } else {
     formData.append("inputFile", file);
   }

   await handleAuthorization(firebase)
   const token = localStorage.getItem('user-token')
   const requestOptions = {
     method : "POST",
     headers: {
       "Authorization":"Bearer " + token
     },
     body : formData
   }

   return fetch(process.env.REACT_APP_API_URL + '/projects/upload', requestOptions)
     .then(handleResponse)
     .then(data => {
         return data
       }
     )
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
        firebaseAuth.auth.currentUser.getIdToken()
          .then((idToken: string) => {
            if(token !== idToken) {
              localStorage.setItem('user-token',idToken)
            }
        })
    } else {
     window.location.href = '/auth';
    }
}

