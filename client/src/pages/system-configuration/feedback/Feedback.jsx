import { useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'

import TextField from '@mui/material/TextField'

import Fade from '@mui/material/Fade'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

import DataContext from '../../../context/data/dataContext'
import {
  API,
  DEFAULT_DATA_LIST_STATE,
  MODE,
  ROW_HEIGHT,
  STORAGE_NAME,
} from '../../../config'
import Paginations from '../../../components/page-tools/Pagination'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import {
  isMobileOrTablet,
  objectArrayToCamel,
  reFormatFullDate,
} from '../../../utils'
import SkeletonLoading from '../../../components/page-tools/SkeletonLoading'
import { qs } from '../../../utils/domUtils'
import { inputStyle2 } from '../../../components/page-tools/form-style'

const btr = {
  mr: 0.5,
}

const Feedback = () => {
  const reduceHeight = 275
  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)
  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  const { systemProperties } = useContext(DataContext)

  const qFormRef = useRef(null)
  const [dataList, setDataList] = useState(DEFAULT_DATA_LIST_STATE)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 2500,
    severity: null,
  })
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties?.defaultList ||
      10
  )
  const [pageNum, setPageNum] = useState(1)
  const [stateFilterOptions, setStateFilterOptions] = useState(null)

  const cols = [
    {
      field: 'hn',
      headerName: 'HN',
      width: 120,
    },
    {
      field: 'accession',
      headerName: 'Accession',
      width: 170,
    },
    {
      field: 'feedback',
      headerName: 'Feedback',
      minWidth: 320,
      flex: 1,
      renderCell: params => {
        return (
          <div
            style={{ marginTop: 7, marginBottom: 7, whiteSpace: 'pre-line' }}
          >
            {params.row.feedback}
          </div>
        )
      },
    },
    {
      field: 'fromUser',
      headerName: 'By User',
      width: 270,
    },
    {
      field: 'dttm',
      headerName: 'Date/Time',
      width: 190,
      valueGetter: params => {
        let [date, time] = reFormatFullDate(params.row.dttm)

        return date + ' ' + time
      },
    },
  ]

  useEffect(() => {
    const defaultRows =
      parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties.defaultList
    setRowsPerPage(defaultRows)
    fetchData(null, 1, defaultRows)

    return () => {}
    // eslint-disable-next-line
  }, [])

  async function fetchData(formFilterOptions, page, row, isReload = false) {
    setDataList(prev => ({
      ...DEFAULT_DATA_LIST_STATE,
      total: prev.total || DEFAULT_DATA_LIST_STATE.total,
    }))

    let params = {
      rowsPerPage: row || rowsPerPage,
      pageNum: page || pageNum,
    }

    let filters = formFilterOptions || stateFilterOptions || {}

    if (!isReload) {
      params = { ...params, ...filters }
    }

    try {
      const resFeedback = await axios.get(API.FEEDBACK, {
        params,
      })

      let newObj = objectArrayToCamel(resFeedback.data.data)

      // console.log(newObj)

      setDataList({
        ...dataList,
        data: newObj,
        total: resFeedback.data.total,
      })
    } catch (error) {
      console.log(error)
    }
  }

  function handleQuickSearch(e) {
    e?.preventDefault()
    const form = qFormRef.current
    const filter = qs('input[name="filter"]', form)
    const formFilters = { filter: filter.value.trim(), isQuickSearch: 'yes' }
    if (!formFilters.filter) return handleReloadClick()

    setPageNum(1)
    setStateFilterOptions(formFilters)
    fetchData(formFilters, 1, rowsPerPage)
  }

  function resetForm() {
    setStateFilterOptions(null)
    const qform = qFormRef.current
    qform?.reset()
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

  function handleReloadClick() {
    resetForm()
    setStateFilterOptions(null)
    setPageNum(1)
    const isReload = true
    fetchData(null, 1, rowsPerPage, isReload)
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: 0,
          padding: 0,
        }}
      >
        <div style={{ marginTop: 0 }}>
          <IconButton
            onClick={handleReloadClick}
            title='Reload'
            aria-label='reload'
            sx={{
              ...btr,
              color: theme => MODE[theme.palette.mode].buttonReload,
            }}
            component='span'
          >
            <RefreshIcon />
          </IconButton>
        </div>

        <form ref={qFormRef} onSubmit={handleQuickSearch} autoComplete='off'>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            margin='dense'
            InputProps={{
              placeholder: 'hn, accession, feedback, user...',
              endAdornment: (
                <InputAdornment
                  sx={{ cursor: 'pointer', mr: -1 }}
                  position='end'
                  onClick={handleQuickSearch}
                >
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              ...inputStyle2,
              width: 350,
              mt: 0,
            }}
            name='filter'
            autoFocus={!isMobileOrTablet()}
            // placeholder='HN...'
          />
        </form>
      </div>

      {!dataList.data && <SkeletonLoading style={{ mt: 0 }} />}

      {dataList.data && (
        <Fade in={dataList?.data ? true : false} timeout={400}>
          <div>
            <DataGrid
              // onSelectionModelChange={ids => {
              //   const selectedIDs = new Set(ids)
              //   const selectedRowData = dataList.data?.filter(row => {
              //     return selectedIDs.has(row.id)
              //   })
              //   setRowSelected(selectedRowData)
              // }}
              rows={dataList.data || []}
              checkboxSelection={false}
              columns={cols}
              disableSelectionOnClick
              // onRowClick={handleEditClick}
              hideFooterPagination
              rowHeight={ROW_HEIGHT}
              headerHeight={ROW_HEIGHT}
              hideFooterSelectedRowCount
              hideFooter
              // pageSize={20}
              // autoHeight={true}
              getRowHeight={() => 'auto'}
              // density='compact'
              sx={{
                minHeight: elHeight,
                minWidth: 500,
                borderLeft: '0px',
                borderRight: '0px',
                borderBottom: '0px',
                marginTop: '5px',

                color: theme => MODE[theme.palette.mode].dataGrid.font,
                '.MuiDataGrid-row': {
                  fontSize: 16,
                  borderBottom: theme =>
                    `1px solid ${MODE[theme.palette.mode].dataGrid.rowBorder}`,
                },
                '.MuiDataGrid-row:hover': {
                  backgroundColor: theme =>
                    MODE[theme.palette.mode].dataGrid.rowHover,
                  cursor: 'pointer',
                },
                '.MuiDataGrid-columnHeaders ': {
                  borderBottom: theme =>
                    `1px solid ${
                      MODE[theme.palette.mode].dataGrid.headerBorder
                    }`,
                  backgroundColor: theme =>
                    MODE[theme.palette.mode].dataGrid.headerBackground,
                  color: theme => MODE[theme.palette.mode].dataGrid.font,
                },
                '.MuiSvgIcon-root': {
                  color: theme => MODE[theme.palette.mode].dataGrid.checkbox,
                },
                '.MuiCheckbox-root': {
                  bgcolor: theme => MODE[theme.palette.mode].tab.active,
                  p: 0,
                  borderRadius: 1,
                },
                '.MuiCheckbox-root:hover ': {
                  bgcolor: theme => MODE[theme.palette.mode].tab.active,
                },
                '.MuiCheckbox-colorPrimary.Mui-disabled': {
                  height: 25,
                  width: 25,
                  opacity: 0,
                  borderRadius: 0,
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'red' : '#FFFFFF',
                },
              }}
            />
            <Paginations
              total={dataList.total}
              pageNum={pageNum}
              setPageNum={setPageNum}
              rowsPerPage={rowsPerPage || systemProperties.defaultList}
              setRowsPerPage={setRowsPerPage}
              handleChangePage={handleChangePage}
              handleChangeRows={handleChangeRows}
            />
          </div>
        </Fade>
      )}

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default Feedback
