import React, {useEffect, useRef, useState} from 'react';
import { projectServices } from "../services/ProjectServices";
import {Tooltip, Fab} from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3880ff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

interface UploadProps {
  name: string;
  firebase: any;
  isUploading(val: boolean): any;
  uploadError(val: boolean): any;
  enable: boolean;
}

const Upload: React.FC<UploadProps> = (props:UploadProps) => {
  const {
    name,
    firebase,
    isUploading,
    uploadError,
    enable,
  } = props;
  const inputFile = useRef(null);
  const [upload, setUpload] = useState(false);

  useEffect(() => {
    if (upload === true) {
      try {
        isUploading(true);
        uploadError(false)

        // @ts-ignore
        projectServices.uploadDocuments(name, inputFile.current.files[0], firebase).then(data => {
          isUploading(false);
        })
          .catch(e => {
            uploadError(true)
            isUploading(false)
          })
      } catch (e) {}
      setUpload(false)
    }
  }, [upload])

  return (
    <Tooltip title={<h5>The uploaded file should be CSV formatted. If there are preset IDs, there should be two
              'columns' in the following order: ID and DOCUMENT, where ID only consists of integers. Otherwise,there should
               only be one column, DOCUMENT.</h5>} placement="top">
      <label htmlFor="upload-button">
        <input
          style={{ display: 'none' }}
          id="upload-button"
          name="upload-button"
          type="file"
          accept=".csv"
          ref={inputFile}
          onChange={e => setUpload(true)}
        />

        <MuiThemeProvider theme={theme}>
          {enable ?
            <Fab color="primary" component="span" aria-label="add"> <AddIcon /> </Fab>
            : <Fab color="primary" disabled component="span" aria-label="add"> <AddIcon /> </Fab>}
        </MuiThemeProvider>

      </label>
    </Tooltip>
  );
}

export default Upload;

