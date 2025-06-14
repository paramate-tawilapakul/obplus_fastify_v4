import { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
// import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import useTheme from '@mui/material/styles/useTheme'
import ImageIcon from '@mui/icons-material/Image'

import { useConfirm } from 'material-ui-confirm'

import {
  DEFAULT_OPTION_STATE,
  DEFAULT_DATE_STATE,
  DEFAULT_DATA_LIST_STATE,
  API,
  reqHeader,
  dialogStyle,
  STORAGE_NAME,
  APP_ROUTES,
} from '../../config'

import { qsa, qs } from '../../utils/domUtils'

import {
  formDataToObject,
  isValidInput,
  objectArrayToCamel,
  reFormatDate,
  reFormatTime,
  statusToName,
} from '../../utils'

import { teachingFolders, moveTeachingFiles } from '../worklist/tabs/helper'
import { openImage, viewPdf } from '../report/report-utils'

import SnackBarWarning from '../../components/page-tools/SnackBarWarning'
import ManageWorklistButton from '../../components/page-tools/ManageWorklistButton'
import BackDrop from '../../components/page-tools/BackDrop'
import DataGridTemplate from '../../components/page-tools/DataGridTemplate'
// import TipBox from '../../components/page-tools/TipBox'
import TreeFolder from '../../components/page-tools/TreeFolder'
import { blue, brown, red } from '@mui/material/colors'

function List({ selectedFolder, systemProperties }) {
  const tabName = 'teachingFiles'
  const confirm = useConfirm()
  const theme = useTheme()

  const doctor = JSON.parse(window.localStorage.getItem(STORAGE_NAME.doctor))
  const [openBackDrop, setOpenBackDrop] = useState(false)
  const formRef = useRef(null)
  const qFormRef = useRef(null)
  const [pageNum, setPageNum] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(
    systemProperties?.defaultList || 10
  )
  // const [optionSelected, setOptionSelected] = useState(DEFAULT_OPTION_STATE)
  const [rowSelected, setRowSelected] = useState([])
  const [selectedMoveFolder, setSelectedMoveFolder] = useState('')
  // const [tag, setTag] = useState([])
  const [date, setDate] = useState(DEFAULT_DATE_STATE)
  const [stateFilterOptions, setStateFilterOptions] = useState(null)
  const [dataList, setDataList] = useState(DEFAULT_DATA_LIST_STATE)
  const [teaching, setTeaching] = useState({
    show: false,
    data: [],
  })
  const [noteDialog, setNoteDialog] = useState({
    show: false,
    note: null,
    accession: null,
    fileId: null,
  })
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 3000,
    severity: null,
  })

  const focusNoteInputField = parent => {
    if (parent) {
      const note = qs('input[name="teachingNote"]', parent)
      setTimeout(() => {
        note.focus()
      }, 100)
    }
  }

  const columns = [
    {
      disableColumnMenu: true,
      sortable: false,
      hideable: false,
      disableExport: true,
      field: 'action',
      headerName: 'Action',
      width: 90,
      renderCell: params => {
        return (
          <>
            <ImageIcon
              titleAccess='View PACS image'
              sx={{
                cursor: 'pointer',
                // mr: 0.5,
                ml: -1,
                color: theme =>
                  theme.palette.mode === 'dark' ? '#F5F5F5' : '#333',
              }}
              onClick={() =>
                openImage(
                  systemProperties.uniwebAddress,
                  params.row.accessionNumber
                )
              }
            />
            {['D', 'R'].includes(params.row.studyStatus) && (
              <IconButton
                style={{}}
                size='small'
                onClick={() =>
                  viewPdf(
                    {
                      accession: params.row.accessionNumber,
                      status: params.row.studyStatus,
                      prelimDoctor: params.row.nameOfPhysicsReadingStudy,
                      reportedDoctor: params.row.reportedDoctor,
                    },
                    systemProperties,
                    doctor,
                    null,
                    true,
                    setOpenBackDrop
                  )
                }
                disableRipple
              >
                <PictureAsPdfIcon
                  titleAccess='View report'
                  style={{
                    color: theme.palette.mode === 'dark' ? '#FCC7B9' : red[400], //light
                  }}
                />
              </IconButton>
            )}

            <IconButton
              disableRipple
              size='small'
              onClick={() => handleEditNote(params.row)}
            >
              <ModeEditIcon
                titleAccess='Edit note'
                style={{
                  color: theme.palette.mode === 'dark' ? blue[300] : brown[400],
                  marginLeft: '-5px',
                }}
              />
            </IconButton>
          </>
        )
      },
    },
    {
      field: 'patientId',
      headerName: 'HN',
      width: 100,
    },
    {
      field: 'patientName',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'studyDescription',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'studyDate',
      headerName: 'Order Date/Time',
      width: 174,
      valueGetter: params =>
        reFormatDate(params.row.studyDate) +
        ' ' +
        reFormatTime(params.row.studyTime),
    },
    {
      field: 'studyStatus',
      headerName: 'Status',
      width: 80,
      valueGetter: params => {
        return statusToName(params.row.studyStatus)
      },
    },
    {
      field: 'note',
      headerName: 'Note',
      flex: 1,
      minWidth: 175,
      // renderCell: params => {
      //   if (!params.row.note) return ''

      //   return <TipBox message={params.row.note} placement='left-start' />
      // },
    },
    // {
    //   field: 'tags',
    //   headerName: 'Tags',
    //   minWidth: 50,
    //   valueFormatter: ({ value }) => value.join(', ').toString(),
    //   renderCell: params => {
    //     if (!params.row.tags) return ''

    //     return (
    //       params.row?.tags?.length > 0 && (
    //         <TipBox
    //           message={params.row.tags.join(', ')}
    //           placement='left-start'
    //         />
    //       )
    //     )
    //   },
    // },
  ]

  useEffect(() => {
    resetForm()
    // focusQuickSearch()

    if (selectedFolder) {
      // setRowsPerPage(systemProperties.defaultList)
      handleReloadClick(null, systemProperties.defaultList)
    }

    return () => {}
    // eslint-disable-next-line
  }, [selectedFolder])

  async function fetchData(formFilterOptions, page, row, isReload = false) {
    setDataList(prev => ({
      ...DEFAULT_DATA_LIST_STATE,
      total: prev.total || DEFAULT_DATA_LIST_STATE.total,
    }))

    setRowSelected([])

    let params = {
      tab: tabName,
      rowsPerPage: row || rowsPerPage,
      pageNum: page || pageNum,
      folderId: selectedFolder,
    }

    let filters = formFilterOptions || stateFilterOptions || {}

    if (!isReload) {
      params = { ...params, ...filters }
    }

    const resWorklist = await axios.get(API.TEACHING, {
      params,
    })

    let newObj = objectArrayToCamel(resWorklist.data.data)
    // console.log(newObj)

    setDataList({ ...dataList, data: newObj, total: resWorklist.data.total })
  }

  function handleAdvSearch(e) {
    setPageNum(1)
    e?.preventDefault()
    const formData = formRef.current
    const data = qsa('input', formData)
    let check = isValidInput(data)
    const formFilters = formDataToObject(data)
    // formFilters.tagId = tag?.length > 0 ? tag.map(v => v.id).join(',') : ''

    let isEmptyForm = true
    Object.keys(formFilters).forEach(key => {
      if (formFilters[key]) {
        isEmptyForm = false
      }
    })

    if (isEmptyForm) {
      return handleReloadClick()
    }

    if (check.isValid) {
      setStateFilterOptions(formFilters)
      fetchData(formFilters, 1, rowsPerPage)
    } else {
      setSnackWarning({
        show: true,
        message: check.message,
        severity: 'warning',
      })
    }
  }

  // function focusQuickSearch() {
  //   const form = qFormRef.current
  //   const hn = qs('input[name="hn"]', form)
  //   hn.focus()
  // }

  function handleChangePage(e, page) {
    setPageNum(page)
    fetchData(stateFilterOptions, page, rowsPerPage)
  }

  function handleChangeRows(e) {
    const rows = e.target.value
    setPageNum(1)
    setRowsPerPage(rows)
    fetchData(stateFilterOptions, 1, rows)
  }

  function resetForm() {
    setStateFilterOptions(null)
    // setOptionSelected(DEFAULT_OPTION_STATE)
    setDate(DEFAULT_DATE_STATE)
    // setTag([])
    const formData = formRef.current
    formData?.reset()
    const qform = qFormRef.current
    qform?.reset()
  }

  function handleReloadClick() {
    resetForm()
    setStateFilterOptions(null)
    setPageNum(1)
    const isReload = true
    fetchData(null, 1, rowsPerPage, isReload)
  }

  function handleCellClick() {
    return
  }

  function handleEditNote(param) {
    let editValue = dataList.data.filter(
      t => t.accessionNumber === param.accessionNumber
    )

    setNoteDialog({
      show: true,
      note: editValue[0].note,
      accession: param.accessionNumber,
      fileId: param.fileId,
    })
  }

  async function handleSaveNote(e) {
    e?.preventDefault()
    if (noteDialog.note && noteDialog.note.trim() !== '') {
      await axios.put(
        API.TEACHING_NOTE,
        {
          fileId: noteDialog.fileId,
          note: noteDialog.note,
          accession: noteDialog.accession,
          folderId: selectedFolder,
        },
        reqHeader
      )

      let editValue = dataList.data.filter(
        t => t.accessionNumber === noteDialog.accession
      )
      editValue[0].note = noteDialog.note

      handleDialogClose()

      setSnackWarning({
        show: true,
        message: 'Save note completed',
        severity: 'success',
        autoHideDuration: 2000,
      })
    }
  }

  function handleDialogClose() {
    setNoteDialog({ show: false, note: null, accession: null, fileId: null })
  }

  async function handleDeleteTeachingFiles() {
    if (!rowSelected || rowSelected.length === 0) {
      return setSnackWarning({
        show: true,
        message: 'Select minimum 1 record to Delete',
        severity: 'warning',
        autoHideDuration: 3000,
      })
    }

    confirm({
      title: `Confirm to delete ?`,
      confirmationButtonProps: { autoFocus: true },
      dialogProps: {
        maxWidth: 'xs',
        PaperProps: { sx: dialogStyle },
      },
    })
      .then(async () => {
        for (const row of rowSelected) {
          await axios.delete(API.TEACHING_NOTE, {
            params: {
              accession: row.accessionNumber,
              fileId: row.fileId,
              folderId: row.folderId,
            },
          })
        }

        setSnackWarning({
          show: true,
          message: 'Delete selected row completed',
          severity: 'success',
          autoHideDuration: 3000,
        })

        handleReloadClick()
      })
      .catch(e => {
        console.log(e)
      })
  }

  function handleTeachingFolders() {
    teachingFolders(rowSelected, setSnackWarning, systemProperties, setTeaching)
  }

  async function handleAddTeachingFiles() {
    await moveTeachingFiles(
      rowSelected,
      selectedMoveFolder,
      setSnackWarning,
      setTeaching
    )

    handleReloadClick()
  }

  return (
    <>
      <ManageWorklistButton
        handleReloadClick={handleReloadClick}
        handleSearch={handleAdvSearch}
        formRef={formRef}
        tab={tabName}
        date={date}
        setDate={setDate}
        reset={resetForm}
        stateFilterOptions={stateFilterOptions}
        handleDeleteTeachingFiles={handleDeleteTeachingFiles}
        handleTeachingFolders={handleTeachingFolders}
        // tag={tag}
        // setTag={setTag}
      />

      <DataGridTemplate
        dataList={dataList}
        columns={columns}
        rowsPerPage={rowsPerPage}
        handleCellClick={handleCellClick}
        systemProperties={systemProperties}
        pageNum={pageNum}
        setPageNum={setPageNum}
        setRowsPerPage={setRowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRows={handleChangeRows}
        setRowSelected={setRowSelected}
        tab={tabName}
        module={APP_ROUTES.teachingFiles}
      />
      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />

      <Dialog open={noteDialog.show} onClose={handleDialogClose} maxWidth='md'>
        <DialogContent>
          <Stack direction='row' justifyContent='center'>
            <form onSubmit={handleSaveNote} autoComplete='off'>
              <TextField
                label='Note'
                variant='outlined'
                size='small'
                margin='dense'
                required
                name='teachingNote'
                value={noteDialog.note || ''}
                onChange={e =>
                  setNoteDialog(prev => ({ ...prev, note: e.target.value }))
                }
                ref={focusNoteInputField}
                sx={{ mt: 0.5, minWidth: 350 }}
              />
            </form>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ mr: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveNote}>Save</Button>
        </DialogActions>
      </Dialog>

      {teaching.show && (
        <TreeFolder
          teaching={teaching}
          setTeaching={setTeaching}
          handleAddTeachingFiles={handleAddTeachingFiles}
          setSnackWarning={setSnackWarning}
          setSelectedFolder={setSelectedMoveFolder}
          selectedFolder={selectedMoveFolder}
          isMove={true}
        />
      )}
      <BackDrop openBackDrop={openBackDrop} />
    </>
  )
}

List.propTypes = {
  selectedFolder: PropTypes.string.isRequired,
  systemProperties: PropTypes.object.isRequired,
}

export default List
