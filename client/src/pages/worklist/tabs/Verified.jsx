import { useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import useTheme from '@mui/material/styles/useTheme'

import {
  reFormatDate,
  reFormatTime,
  isValidInput,
  formDataToObject,
} from '../../../utils'

import { qsa } from '../../../utils/domUtils'

import {
  API,
  APP_CONFIG,
  APP_ROUTES,
  DEFAULT_DATA_LIST_STATE,
  DEFAULT_DATE_STATE,
  // DEFAULT_OPTION_STATE,
  EXCEPT_COLUMNS,
  STORAGE_NAME,
  resetReportId,
} from '../../../config'
import ManageWorklistButton from '../../../components/page-tools/ManageWorklistButton'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import DataContext from '../../../context/data/dataContext'
import DataGridTemplate from '../../../components/page-tools/DataGridTemplate'
import TreeFolder from '../../../components/page-tools/TreeFolder'
import { addTeachingFiles, openPatientInfo, teachingFolders } from './helper'
import { openImage } from '../../report/report-utils'
import WorklistInfo from '../../../components/page-tools/WorklistInfo'
import StatusChip from '../../../components/page-tools/StatusChip'
import BackDrop from '../../../components/page-tools/BackDrop'
import TipBox from '../../../components/page-tools/TipBox'

const Verified = ({ tabName }) => {
  const theme = useTheme()
  const history = useHistory()
  const { user, doctor, stype, systemProperties } = useContext(DataContext)
  const [openBackDrop, setOpenBackDrop] = useState(false)

  const [dataList, setDataList] = useState(DEFAULT_DATA_LIST_STATE)
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties?.defaultList ||
      10
  )
  const [pageNum, setPageNum] = useState(1)
  const [date, setDate] = useState(DEFAULT_DATE_STATE)
  const [rowSelected, setRowSelected] = useState([])
  // const [optionSelected, setOptionSelected] = useState(DEFAULT_OPTION_STATE)
  const [selectedFolder, setSelectedFolder] = useState('')
  const [teaching, setTeaching] = useState({
    show: false,
    data: [],
  })

  const formRef = useRef(null)

  const [stateFilterOptions, setStateFilterOptions] = useState(null)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 3000,
    severity: null,
  })

  useEffect(() => {
    const defaultRows =
      parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties.defaultList

    setRowsPerPage(defaultRows)

    fetchData(null, 1, defaultRows)

    // eslint-disable-next-line
  }, [stype])

  const columns = [
    {
      field: 'info',
      headerName: 'Action',
      disableColumnMenu: true,
      disableExport: true,
      hideable: false,
      sortable: false,
      width: 85,
      renderCell: params => (
        <WorklistInfo
          setOpenBackDrop={setOpenBackDrop}
          theme={theme}
          params={params}
          systemProperties={systemProperties}
          doctor={doctor}
          user={user}
          handleCellClick={() => handleCellClick(params, false)}
        />
      ),
    },
    {
      disableColumnMenu: true,
      hideable: false,
      sortable: false,
      field: 'obStudyType',
      headerName: 'Type',
      width: 64,
      renderCell: params =>
        params.row.obStudyType && (
          <StatusChip studyType={params.row.obStudyType} />
        ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'hn',
      headerName: 'HN',
      minWidth: 110,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 260,
    },
    {
      disableColumnMenu: true,
      hideable: false,
      sortable: false,
      field: 'date',
      headerName: 'Order Date/Time',
      flex: 1,
      minWidth: 174,
      valueGetter: params =>
        reFormatDate(params.row.studyDate) +
        ' ' +
        reFormatTime(params.row.studyTime),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 80,
      valueGetter: params => params.row.usMachine || params.row.location,
    },
    {
      field: 'prelimDoctor',
      headerName: 'Reported By',
      minWidth: 180,
      flex: 1,
      valueFormatter: ({ value }) => {
        if (!value) return ''

        const obj = doctor.filter(
          d => d.radName === value || d.radCode === value
        )[0]
        return obj?.radDesc || obj?.radDescEng || ''
      },
      renderCell: params => {
        const allReportedDoc = params.row.prelimDoctor
          ? params.row.prelimDoctor.split(',')
          : params.row.reportedDoctor.split(',')
        const radName = allReportedDoc.map(
          rd =>
            doctor
              .filter(d => d.radName === rd || d.radCode === rd)
              .map(d => d?.radDesc || d?.radDescEng || '')[0] || ''
        )

        if (allReportedDoc.length > 1) {
          let component = radName.map((name, i) => (
            <Typography variant='body1' key={i} title={name}>
              {name}
            </Typography>
          ))

          return (
            <TipBox
              message={radName.join(',')}
              component={component}
              placement='left-start'
            />
          )
        }

        return (
          <Typography variant='body1' title={radName[0]}>
            {radName[0]}
          </Typography>
        )
      },
    },

    // {
    //   field: 'sourceAe',
    //   headerName: 'AE',
    //   width: 120,
    // },
    // {
    //   field: 'reportedDoctor',
    //   headerName: 'Verified By',
    //   minWidth: 180,
    //   flex: 1,
    //   valueFormatter: ({ value }) => {
    //     if (!value) return ''

    //     const obj = doctor.filter(
    //       d => d.radCode === value || d.radName === value
    //     )[0]
    //     return obj?.radDesc || ''
    //   },
    //   renderCell: params => {
    //     const allReportedDoc = params.row.reportedDoctor.split(',')
    //     const radName = allReportedDoc.map(
    //       rd =>
    //         doctor
    //           .filter(d => d.radCode === rd || d.radName === rd)
    //           .map(d => d.radDesc)[0] || ''
    //     )

    //     if (allReportedDoc.length > 1) {
    //       let component = radName.map((name, i) => (
    //         <Typography variant='body1' key={i} title={name}>
    //           {name}
    //         </Typography>
    //       ))

    //       return (
    //         <TipBox
    //           message={radName.join(',')}
    //           component={component}
    //           placement='left-start'
    //         />
    //       )
    //     }

    //     return (
    //       <Typography variant='body1' title={radName[0]}>
    //         {radName[0]}
    //       </Typography>
    //     )
    //   },
    // },
  ]

  async function fetchData(formFilterOptions, page, row, isReload = false) {
    setDataList(prev => ({
      ...DEFAULT_DATA_LIST_STATE,
      total: prev.total || DEFAULT_DATA_LIST_STATE.total,
    }))

    setTeaching({
      show: false,
      data: [],
    })

    let params = {
      tab: tabName,
      rowsPerPage: row || rowsPerPage,
      pageNum: page || pageNum,
      status: 'R', // N D R
      stype, // all,1(ob),2(gyn)
    }

    let filters = formFilterOptions || stateFilterOptions || {}

    if (!isReload) {
      params = { ...params, ...filters }
    }

    const resWorklist = await axios.get(API.WORKLIST, {
      params,
    })

    setDataList({
      ...dataList,
      data: resWorklist.data.data,
      total: resWorklist.data.total,
    })
  }

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
    const formData = formRef.current
    formData?.reset()
  }

  function handleAdvSearch(e) {
    setPageNum(1)
    e?.preventDefault()
    const formData = formRef.current
    const data = qsa('input', formData)
    let check = isValidInput(data)
    const formFilters = formDataToObject(data)

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

  function handleReloadClick() {
    setTeaching({
      show: false,
      data: [],
    })
    resetForm()
    setStateFilterOptions(null)
    setPageNum(1)
    const isReload = true
    fetchData(null, 1, rowsPerPage, isReload)
  }

  function handleCellClick(params, withImage = true) {
    if (withImage && EXCEPT_COLUMNS.includes(params.field)) return

    resetReportId()

    if (withImage)
      openImage(systemProperties.uniwebAddress, params.row.accession)

    openPatientInfo(
      history,
      `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.patientInfo}?accession=${params.row.accession}`
    )
  }

  function handleTeachingFolders() {
    teachingFolders(rowSelected, setSnackWarning, systemProperties, setTeaching)
  }

  async function handleAddTeachingFiles(inputValue) {
    addTeachingFiles(
      rowSelected,
      selectedFolder,
      inputValue,
      setSnackWarning,
      setTeaching
    )
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
        handleTeachingFolders={handleTeachingFolders}
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
        module={APP_ROUTES.worklist}
        tab={tabName}
      />

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />

      {teaching.show && (
        <TreeFolder
          teaching={teaching}
          setTeaching={setTeaching}
          handleAddTeachingFiles={handleAddTeachingFiles}
          setSnackWarning={setSnackWarning}
          setSelectedFolder={setSelectedFolder}
          selectedFolder={selectedFolder}
        />
      )}
      <BackDrop openBackDrop={openBackDrop} />
    </>
  )
}

export default Verified
