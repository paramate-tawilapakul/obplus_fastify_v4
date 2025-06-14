import { useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

import {
  reFormatDate,
  reFormatTime,
  isValidInput,
  formDataToObject,
} from '../../../utils'

import { qsa } from '../../../utils/domUtils'

import {
  APP_CONFIG,
  API,
  APP_ROUTES,
  DEFAULT_DATA_LIST_STATE,
  DEFAULT_DATE_STATE,
  // DEFAULT_OPTION_STATE,
  EXCEPT_COLUMNS,
  STORAGE_NAME,
  resetReportId,
  worklistIntervalRefresh,
} from '../../../config'
import ManageWorklistButton from '../../../components/page-tools/ManageWorklistButton'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import DataContext from '../../../context/data/dataContext'
import DataGridTemplate from '../../../components/page-tools/DataGridTemplate'
import { openPatientInfo } from './helper'
import { openImage } from '../../report/report-utils'
import StatusChip from '../../../components/page-tools/StatusChip'
import WorklistInfo from '../../../components/page-tools/WorklistInfo'

const New = ({ tabName }) => {
  const history = useHistory()
  const { systemProperties, stype } = useContext(DataContext)

  const [dataList, setDataList] = useState(DEFAULT_DATA_LIST_STATE)
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties?.defaultList ||
      10
  )
  const [pageNum, setPageNum] = useState(1)
  const [date, setDate] = useState(DEFAULT_DATE_STATE)
  // const [rowSelected, setRowSelected] = useState([])
  // const [optionSelected, setOptionSelected] = useState(DEFAULT_OPTION_STATE)

  const formRef = useRef(null)

  const [stateFilterOptions, setStateFilterOptions] = useState(null)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 3000,
    severity: null,
  })

  const columns = [
    {
      field: 'info',
      headerName: 'Action',
      disableColumnMenu: true,
      disableExport: true,
      hideable: false,
      sortable: false,
      width: 63,
      renderCell: params => (
        <WorklistInfo
          params={params}
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
      minWidth: 120,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 270,
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
      width: 120,
      valueGetter: params => params.row.usMachine || params.row.location,
    },
    // {
    //   field: 'sourceAe',
    //   headerName: 'AE',
    //   width: 120,
    // },
  ]

  useEffect(() => {
    let interval = setInterval(() => {
      handleReloadClick()
    }, worklistIntervalRefresh)

    function setReload() {
      clearInterval(interval)
      interval = window.setInterval(() => {
        handleReloadClick()
      }, worklistIntervalRefresh)
    }

    document.addEventListener('mousemove', setReload)

    return () => {
      clearInterval(interval)
      document.removeEventListener('mousemove', setReload)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const defaultRows =
      parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties.defaultList

    setRowsPerPage(defaultRows)

    fetchData(null, 1, defaultRows)

    // eslint-disable-next-line
  }, [stype])

  async function fetchData(formFilterOptions, page, row, isReload = false) {
    setDataList(prev => ({
      ...DEFAULT_DATA_LIST_STATE,
      total: prev.total || DEFAULT_DATA_LIST_STATE.total,
    }))

    let params = {
      tab: tabName,
      rowsPerPage: row || rowsPerPage,
      pageNum: page || pageNum,
      status: 'N', // N D R
      stype: stype, // all,1(ob),2(gyn)
    }

    let filters = formFilterOptions || stateFilterOptions || {}

    if (!isReload) {
      params = { ...params, ...filters }
    }

    const resWorklist = await axios.get(API.WORKLIST, {
      params,
    })
    // console.log(resWorklist.data)

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
    resetForm()
    setStateFilterOptions(null)
    setPageNum(1)
    const isReload = true
    fetchData(null, 1, rowsPerPage, isReload)
  }

  function handleCellClick(params, withImage = true) {
    if (withImage && EXCEPT_COLUMNS.includes(params.field)) return

    resetReportId()

    // flagWhatSearch(lastAction, qFormRef, formRef)
    // setPatient(params.row)
    // openReport(params)
    if (withImage)
      openImage(systemProperties.uniwebAddress, params.row.accession)

    openPatientInfo(
      history,
      `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.patientInfo}?accession=${params.row.accession}`
    )
  }

  return (
    <>
      <ManageWorklistButton
        handleReloadClick={handleReloadClick}
        handleSearch={handleAdvSearch}
        // handleTeachingFolders={handleTeachingFolders}
        formRef={formRef}
        tab={tabName}
        date={date}
        setDate={setDate}
        reset={resetForm}
        stateFilterOptions={stateFilterOptions}
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
        module={APP_ROUTES.worklist}
        tab={tabName}
        isSelectAble={false}
      />

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default New
