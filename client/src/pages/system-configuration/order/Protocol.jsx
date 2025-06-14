import { useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import SaveIcon from '@mui/icons-material/Save'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import Divider from '@mui/material/Divider'
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
  reqHeader,
} from '../../../config'
import Paginations from '../../../components/page-tools/Pagination'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import {
  isMobileOrTablet,
  objNullToEmpty,
  objectArrayToCamel,
} from '../../../utils'
import SkeletonLoading from '../../../components/page-tools/SkeletonLoading'
import { qs } from '../../../utils/domUtils'
import {
  inputStyle2,
  btStyle,
  dialogTitleStyle,
} from '../../../components/page-tools/form-style'

const btr = {
  mr: 0.5,
}

const Protocol = () => {
  const locations = JSON.parse(
    window.localStorage.getItem(STORAGE_NAME.locations)
  )
  const reduceHeight = 275
  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)
  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  const { systemProperties } = useContext(DataContext)

  const [rowSelected, setRowSelected] = useState([])
  const [selected, setSelected] = useState(null)
  const qFormRef = useRef(null)
  const [dataList, setDataList] = useState(DEFAULT_DATA_LIST_STATE)
  const [open, setOpen] = useState(false)
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

  let minutes = []
  for (let i = 15; i <= 180; i += 15) {
    minutes.push(i + '')
  }

  let weight = []
  for (let i = 1; i <= 10; i++) {
    weight.push(i + '')
  }

  const cols = [
    {
      field: 'code',
      headerName: 'Code',
      width: 140,
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 190,
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 190,
      flex: 1,
    },

    {
      field: 'locationId',
      headerName: 'Location',
      width: 130,
      valueGetter: param => {
        let location =
          locations?.find(l => l.id === param.row.locationId)?.code || ''
        if (location === '*') location = 'ALL'

        return location
      },
    },
    // {
    //   field: 'time',
    //   headerName: 'Time(minutes)',
    //   width: 140,
    // },
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
      const resProtocol = await axios.get(API.PROTOCOL, {
        params,
      })

      let newObj = objectArrayToCamel(resProtocol.data.data)

      // console.log(newObj)

      setDataList({
        ...dataList,
        data: newObj,
        total: resProtocol.data.total,
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

  function checkRequiredField(form, fields) {
    const msg = {
      code: 'Protocol Code',
      name: 'Protocol Name',
    }
    let success = true
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]

      if (form[field] === '') {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: `${msg[field]} is required`,
          severity: 'warning',
        }))
        success = false
        break
      }
    }
    return success
  }

  const handleSave = async () => {
    let body = objNullToEmpty(selected)

    let isPass = checkRequiredField(body, ['code', 'name'])

    if (!isPass) return

    // console.log(body)

    try {
      const response = await axios.post(API.PROTOCOL, body, reqHeader)

      if (response.data.data.result) {
        setRowSelected([])
        handleClose()

        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save completed',
          severity: 'success',
        }))
        handleReloadClick()
      } else {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Error, save fail',
          severity: 'error',
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleCreateClick() {
    setSelected({
      code: '',
      name: '',
      tname: '',
      description: '',
      dfStandard: '',
      dfNetwork: '',
      dfGovernment: '',
      dfInter: '',
      time: '15',
      weight: '1',
      locationId: '1',
      bodypart: 'NOT DEFINED',
      isCreate: true,
    })
    setOpen(true)
  }

  async function handleEditClick(params) {
    setSelected(objNullToEmpty(params.row))
    setOpen(true)
  }

  async function handleRemoveClick() {
    const id = rowSelected?.map(r => r.sysId) || []

    if (id.length === 0) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select minimum 1 record you want to delete',
        severity: 'warning',
      }))
    }

    if (!window.confirm('Confirm to delete?')) return

    try {
      const response = await axios.delete(API.PROTOCOL, {
        params: {
          id: id.join(','),
        },
      })

      if (response.data.data.result) {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Delete completed',
          severity: 'success',
        }))
        handleReloadClick()
      } else {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Error, delete fail',
          severity: 'error',
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
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
          <Button
            onClick={handleCreateClick}
            variant='contained'
            sx={{
              ...btr,
              ...btStyle,
            }}
            startIcon={<AddIcon />}
          >
            Create
          </Button>

          <Button
            onClick={handleRemoveClick}
            variant='contained'
            sx={{
              ...btr,
              ...btStyle,
            }}
            startIcon={<RemoveIcon />}
          >
            Remove
          </Button>
        </div>

        <form ref={qFormRef} onSubmit={handleQuickSearch} autoComplete='off'>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            margin='dense'
            InputProps={{
              placeholder: 'Code, Name, Desc...',
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
              width: 220,
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
              onSelectionModelChange={ids => {
                const selectedIDs = new Set(ids)
                const selectedRowData = dataList.data?.filter(row => {
                  return selectedIDs.has(row.id)
                })
                setRowSelected(selectedRowData)
              }}
              rows={dataList.data || []}
              checkboxSelection
              columns={cols}
              disableSelectionOnClick
              onRowClick={handleEditClick}
              hideFooterPagination
              rowHeight={ROW_HEIGHT}
              headerHeight={ROW_HEIGHT}
              hideFooterSelectedRowCount
              hideFooter
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

      {selected && (
        <>
          <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth>
            <DialogTitle sx={dialogTitleStyle}>
              {selected.isCreate ? 'Create New' : 'Edit'} Protocol
            </DialogTitle>
            <Divider />
            <DialogContent
              sx={{
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <TextField
                label='Code *'
                value={selected.code || ''}
                autoFocus={!selected.code ? true : false}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                InputProps={{
                  readOnly: !selected.isCreate ? true : false,
                }}
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    code: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='Name *'
                value={selected.name || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='TName'
                value={selected.tname || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    tname: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='Description'
                value={selected.description || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='DF Standard'
                value={selected.dfStandard || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    dfStandard: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='DF Network'
                value={selected.dfNetwork || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    dfNetwork: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='DF Government'
                value={selected.dfGovernment || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    dfGovernment: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='DF Inter'
                value={selected.dfInter || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    dfInter: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <FormControl
                sx={{ ...inputStyle2, width: '100%', mt: 1 }}
                size='small'
              >
                <InputLabel>Time</InputLabel>
                <Select
                  label='Time'
                  fullWidth
                  value={selected.time}
                  onChange={e =>
                    setSelected(prev => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                >
                  {minutes.map(m => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                sx={{ ...inputStyle2, width: '100%', mt: 1.5 }}
                size='small'
              >
                <InputLabel>Weight</InputLabel>
                <Select
                  label='Weight'
                  fullWidth
                  value={selected.weight}
                  onChange={e =>
                    setSelected(prev => ({
                      ...prev,
                      weight: e.target.value,
                    }))
                  }
                >
                  {weight.map(m => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                sx={{ ...inputStyle2, width: '100%', mt: 1.5 }}
                size='small'
              >
                <InputLabel>Location</InputLabel>
                <Select
                  label='Location'
                  fullWidth
                  value={selected.locationId}
                  onChange={e =>
                    setSelected(prev => ({
                      ...prev,
                      locationId: e.target.value,
                    }))
                  }
                >
                  {locations &&
                    locations.map(location => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.code}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions
              sx={{
                pr: 3,
                pb: 2,
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <Button onClick={handleClose} variant='outlined'>
                Cancel
              </Button>
              <Button
                sx={btStyle}
                onClick={handleSave}
                variant='contained'
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
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

export default Protocol
