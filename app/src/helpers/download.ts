export const downloadHelpers = {
    collectionToCSV,
    downloadBlob,
}

function collectionToCSV(keys : string[] = [], data:JSON[] =[]) {
  console.log(data);
  let replacer = function(key:any, value:any) { return value === null ? '' : value }
  let csv = data.map(function(row:any){
    return keys.map(function(fieldName:any){
      return JSON.stringify(row[fieldName], replacer)
    }).join(',')
  })
  csv.unshift(keys.join(',')) // add header column
  return csv.join('\r\n');
}


function downloadBlob(blob: Blob, filename: string) {
  console.log(blob)
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}