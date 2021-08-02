import { handleAuthorization } from './ProjectServices';

export const EncryptionServices = {
  getUserKeys,
  getEncryptedEntryKey,
  storeCurrentUserkey,
}

async function getUserKeys(firebase: any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token')
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization":"Bearer " + token
    }};

  return fetch(process.env.REACT_APP_API_URL + '/user/user_key', requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
      return data
    })
}

async function getEncryptedEntryKey(project_id: any, firebase: any) {
  await handleAuthorization(firebase)
  const token = localStorage.getItem('user-token')

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      "Authorization": "Bearer " + token
    },
  };


  return fetch(process.env.REACT_APP_API_URL + '/projects/' + project_id
    + '/en_entry_key', requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
      return data.en_entry_key
    })
}

async function storeCurrentUserkey(userKey:any, firebase:any) {
  await handleAuthorization(firebase);
  const token = localStorage.getItem('user-token');

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      "Authorization":"Bearer " + token
    },
    body: JSON.stringify({userKey})
  }
  console.log(requestOptions)

  return fetch(process.env.REACT_APP_API_URL + '/users/store_user_key', requestOptions) // TODO:config.apiUrl
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