export const downloadHelpers = {
    collectionToCSV,
    downloadBlob,
}

function collectionToCSV(keys : string[] = []) {
    return (collection: JSON[] = []) => {
      const headers = keys.map(key => `"${key}"`).join(',');
      const extractKeyValues = (record:any) => keys.map(key => `"${record[key]}"`).join(',');
      return collection.reduce((csv, record) => {
        return (`${csv}\n${extractKeyValues(record)}`).trim();
      }, headers);
    }
}


function downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}