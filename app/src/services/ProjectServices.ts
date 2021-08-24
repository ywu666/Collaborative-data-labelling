import { downloadHelpers } from '../helpers/download'
import { EncryptedHelpers} from '../helpers/encryption'
import { EncryptionServices } from './EncryptionService';
/**
 * The project service encapsulates all backend api calls for performing CRUD operations on project data
 */
export const projectServices = {
    getProjectNames,
    exportCsv,
    getProjectUsers,
    getDescriptionOfAProject,
    setProjectUsers,
    setProjectTags,
    setUserPermissions,
    uploadDocuments,
    createProject,
    getProjectAgreementScore,
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

function exportCsv(projectName: string) {

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

    const exportFields = ['ID', 'DOCUMENT', 'LABEL', 'LABEL STATUS', 'CONTRIBUTOR 1 LABEL', 'CONTRIBUTOR 2 LABEL'];

    return fetch(process.env.REACT_APP_API_URL + '/projects/' + projectName +  '/export', requestOptions)
    //return fetch('https://picsum.photos/list', requestOptions)
    .then(handleResponse)
    .then(downloadHelpers.collectionToCSV(exportFields))
    .then(csv => {
        const blob = new Blob([csv], {type: 'text/csv'});
        downloadHelpers.downloadBlob(blob, projectName + '-export.csv');
    })
    .catch(console.error);
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

async function setProjectUsers(project: string, user: string, firebase:any) {
  await handleAuthorization(firebase)
  const token =  localStorage.getItem('user-token');
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization":"Bearer " + token
    },
    body: JSON.stringify({ user })
  };


  return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/users/add', requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
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
     console.log(JSON.stringify(encryptedArray))
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
