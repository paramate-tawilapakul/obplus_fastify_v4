import axios from 'axios'
import sortBy from 'lodash/sortBy'
// import moment from 'moment'

import {
  //   dialogStyle,
  API,
  reqHeader,
  //   STORAGE_NAME,
} from '../../../config'
import {
  combineTreeArr,
  convertToTreeObj,
  //   formDataToObject,
  //   getHost,
  //   getShowPublic,
  //   objectArrayToCamel,
  //   reFormatDateToDbFormat,
  //   reFormatFullDate,
  //   sleep,
  //   statusToState,
} from '../../../utils'
// import { qs, qsa } from '../../../utils/domUtils'
// import {
//   REPORT_TEMPLATE,
//   removeImageFromContent,
// } from '../../report/report-utils'

export async function teachingFolders(
  rowSelected,
  setSnackWarning,
  systemProperties,
  setTeaching
) {
  if (!rowSelected || rowSelected.length === 0) {
    setAlert(setSnackWarning, `Select minimum 1 row`, 'warning')
    return
  }
  // console.log('rowSelected', rowSelected)
  const response = await axios.get(API.TEACHING_FOLDER)
  let listPrivate = response.data.data
  let listPublic = []
  // console.log(listPrivate)

  if (response.data.total === 0) {
    // create private folder
    const body = {
      folderName: 'Private',
      parentId: 0,
      parent: 'Private',
    }

    const response = await axios.post(API.TEACHING_FOLDER, body, reqHeader)

    listPrivate = [
      {
        FOLDER_ID: response.data.data[0].FOLDER_ID,
        PARENT_ID: response.data.data[0].PARENT_ID,
        FOLDER_NAME: response.data.data[0].FOLDER_NAME,
      },
    ]
  }

  if (systemProperties.publicTeachingFiles === 'enable') {
    const response = await axios.get(API.TEACHING_FOLDER, {
      params: {
        folderName: 'Public',
      },
    })

    listPublic = response.data.data

    if (response.data.total === 0) {
      const body = {
        folderName: 'Public',
        parentId: 0,
        parent: 'Public',
      }

      const response = await axios.post(API.TEACHING_FOLDER, body, reqHeader)

      listPublic = [
        {
          FOLDER_ID: response.data.data[0].FOLDER_ID,
          PARENT_ID: response.data.data[0].PARENT_ID,
          FOLDER_NAME: response.data.data[0].FOLDER_NAME,
        },
      ]
    }
  }

  const data = {
    private: sortBy(listPrivate, o => o.FOLDER_NAME),
    public: sortBy(listPublic, o => o.FOLDER_NAME),
  }
  const privateArr = convertToTreeObj(data.private)
  const publicArr = convertToTreeObj(data.public)

  setTeaching(prev => ({
    ...prev,
    show: true,
    data: combineTreeArr(privateArr, publicArr),
  }))
}

export async function addTeachingFiles(
  rowSelected,
  selectedFolder,
  note = '',
  setSnackWarning,
  setTeaching
) {
  const accessions = rowSelected.map(row => row.accession)

  const body = {
    accessions,
    folderId: selectedFolder,
    note,
  }

  await axios.post(API.TEACHING_FILES, body, reqHeader)

  setAlert(setSnackWarning, `Add teaching files completed`, 'success')

  setTeaching({
    show: false,
    data: [],
  })
}

export async function moveTeachingFiles(
  rowSelected,
  selectedFolder,
  setSnackWarning,
  setTeaching
) {
  for (const row of rowSelected) {
    const body = {
      accession: row.accessionNumber,
      folderId: selectedFolder,
      fileId: row.fileId,
    }

    await axios.patch(API.TEACHING_FILES, body, reqHeader)
  }

  setAlert(setSnackWarning, `Move teaching files completed`, 'success')

  setTeaching({
    show: false,
    data: [],
  })
}

function setAlert(setSnackWarning, message, severity, autoHideDuration = 3000) {
  setSnackWarning(prev => ({
    ...prev,
    show: true,
    message,
    severity,
    autoHideDuration,
  }))
}

export function openPatientInfo(history, url) {
  history.push(url)
}
