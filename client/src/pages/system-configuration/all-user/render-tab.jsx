import { useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import LockResetIcon from '@mui/icons-material/LockReset'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import LockOpenIcon from '@mui/icons-material/LockOpen'
// import RemoveIcon from '@mui/icons-material/Remove'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import EditIcon from '@mui/icons-material/Edit'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1'
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
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { orange } from '@mui/material/colors'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
// import AddIcon from '@mui/icons-material/Add'
import GroupRemoveIcon from '@mui/icons-material/GroupRemove'
import GroupAddIcon from '@mui/icons-material/GroupAdd'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

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
  makePermissionGroup,
  objNullToEmpty,
  objNullToZero,
  objectArrayToCamel,
} from '../../../utils'
import SkeletonLoading from '../../../components/page-tools/SkeletonLoading'
import { qs } from '../../../utils/domUtils'
import {
  inputStyle2,
  btStyle,
  dialogTitleStyle,
} from '../../../components/page-tools/form-style'

const RenderTab = ({ typeId, setAllTabs, setTabSelected }) => {
  const reduceHeight = 275
  const [elHeight, setElHeight] = useState(window.innerHeight - reduceHeight)
  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    setElHeight(e.currentTarget.innerHeight - reduceHeight)
  }

  const { systemProperties, user } = useContext(DataContext)
  const [rowSelected, setRowSelected] = useState([])
  const [selected, setSelected] = useState(null)
  const [group, setGroup] = useState(null)
  const [permission, setPermission] = useState(null)
  const [permissionGroupForm, setPermissionGroupForm] = useState(null)
  const [masterGroup, setMasterGroup] = useState(null)

  const qFormRef = useRef(null)
  const [dataList, setDataList] = useState(DEFAULT_DATA_LIST_STATE)
  const [open, setOpen] = useState(false)
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 2500,
    severity: null,
  })
  const defaultError = {
    radCode: false,
    radUserId: false,
    helpertext: 'already exist!',
  }
  const [error, setError] = useState(defaultError)

  const permissionHeaderColor = '#1d1d1d'

  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties?.defaultList ||
      10
  )
  const [pageNum, setPageNum] = useState(1)
  const [stateFilterOptions, setStateFilterOptions] = useState(null)

  let cols = [
    {
      field: 'info',
      headerName: 'Online Status',
      width: 110,
      disableColumnMenu: true,
      hideable: false,
      sortable: false,
      renderCell: params => (
        <Tooltip
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: theme =>
                  theme.palette.mode === 'dark' ? '#F5F5F5' : '#004b49   ',
                color: theme =>
                  theme.palette.mode === 'dark' ? '#333' : '#f2f2f2',
              },
            },
            arrow: {
              sx: {
                '&::before': {
                  bgcolor: theme =>
                    theme.palette.mode === 'dark' ? '#F5F5F5' : '#004b49   ',
                },
              },
            },
          }}
          enterDelay={0}
          placement='right'
          arrow
          title={
            <Typography sx={{ p: 0.5 }} variant='body1'>
              {params.row.radCode} is{' '}
              {params.row.onlinelFlag === '1' ? 'online' : 'offline'}
            </Typography>
          }
        >
          {params.row.onlinelFlag === '1' ? (
            <RecordVoiceOverIcon style={{ color: orange[500] }} />
          ) : (
            <PersonOffIcon />
          )}
        </Tooltip>
      ),
    },
    {
      field: 'radCode',
      headerName: 'User ID',
      width: 190,
    },
    {
      field: 'radDescription',
      headerName: 'Name TH',
      width: 280,
    },
    {
      field: 'radDescriptionEng',
      headerName: 'Name EN',
      flex: 1,
      minWidth: 280,
    },
  ]

  if (typeId === 0) {
    cols = cols.concat({
      hideable: false,
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
      valueGetter: params => {
        const id = parseInt(params.row.radType)
        return masterGroup.find(g => g.id === id)?.name || 'Unknown'
      },
    })
  }

  useEffect(() => {
    const defaultRows =
      parseInt(window.localStorage.getItem(STORAGE_NAME.customRowsPerPage)) ||
      systemProperties.defaultList
    setRowsPerPage(defaultRows)
    fetchData(null, 1, defaultRows)

    return () => {}
    // eslint-disable-next-line
  }, [])

  async function checkIsExist(params) {
    try {
      const res = await axios.get(API.CHECK_IS_EXIST, {
        params,
      })

      const key = params.column === 'RAD_CODE' ? 'radCode' : 'radUserId'

      if (res.data.data === 1) {
        setError(prev => ({
          ...prev,
          [key]: true,
        }))
      } else {
        setError(prev => ({ ...prev, [key]: false }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function checkIsExistGroupName(value) {
    try {
      const res = await axios.get(API.CHECK_IS_EXIST, {
        params: {
          table: 'RIS_USER_GROUP',
          column: 'GR_NAME',
          value,
        },
      })

      if (res.data.data === 1) {
        return true
      }

      return false
    } catch (error) {
      console.log(error)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
    setError(defaultError)
  }

  const handleCloseGroup = () => {
    setOpen(false)
    setGroup(null)
  }

  const handleClosePermission = () => {
    setOpen(false)
    setPermission(null)
    setPermissionGroupForm(null)
  }

  function checkRequiredField(form, fields) {
    const msg = {
      radCode: 'User Id',
      radDescription: 'Name TH',
      radUserId: 'Care Provider',
      // radPassword: 'Password',
      radType: 'Group',
    }
    let success = true
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]

      if (field === 'radType') {
        if (form[field] === 0) {
          setSnackWarning(prev => ({
            ...prev,
            show: true,
            message: `${msg[field]} is required`,
            severity: 'warning',
          }))
          success = false
          break
        }
      } else {
        if (field === 'radUserId' && !form.isCreate) {
          // console.log('edit, not check care provider')
        } else {
          // console.log('check care provider')
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
      }
    }
    return success
  }

  const handleSavePermission = async () => {
    try {
      const response = await axios.put(
        API.PERMISSION,
        { id: typeId, data: permission },
        reqHeader
      )
      if (response.data.data.result) {
        handleClosePermission()

        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save completed',
          severity: 'success',
        }))
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

  const handleSave = async () => {
    if (error.radCode) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `${selected.radCode} already exist!`,
        severity: 'warning',
      }))
    }

    if (error.radUserId) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: `${selected.radUserId} already exist!`,
        severity: 'warning',
      }))
    }

    let body = objNullToEmpty(selected)

    let isPass = checkRequiredField(body, [
      'radCode',
      'radDescription',
      // 'radPassword',
      'radUserId',
      'radType',
    ])

    if (!isPass) return

    // if (body.radPassword !== body.radRePassword) {
    //   return setSnackWarning(prev => ({
    //     ...prev,
    //     show: true,
    //     message: 'Password not match, Please check',
    //     severity: 'warning',
    //   }))
    // }

    try {
      const response = await axios.post(
        API.USER,
        {
          ...body,
        },
        reqHeader
      )

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

  const handleSaveGroup = async () => {
    if (group.name.trim() === '') {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Group name is required!',
        severity: 'warning',
      }))
    }
    /// save to db
    try {
      const isExist = await checkIsExistGroupName(group.name)

      if (isExist) {
        return setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Group name already exist',
          severity: 'warning',
        }))
      }

      let response
      if (!group.isCreate) {
        response = await axios.put(
          API.USER_GROUP,
          {
            name: group.name,
            id: group.id,
          },
          reqHeader
        )
      } else {
        // check name is exist?
        response = await axios.post(
          API.USER_GROUP,
          {
            name: group.name,
          },
          reqHeader
        )
      }

      if (response.data.data.result) {
        if (!group.isCreate) {
          // edit
          // update state
          setAllTabs(prev => {
            return prev.map(p => {
              if (p.id === group.id) {
                return { ...p, name: group.name }
              }
              return p
            })
          })
          setTabSelected(group.name)
          setOpen(false)

          setAllTabs(prev => {
            return prev.map(p => {
              if (p.id === typeId) {
                return { ...p, name: group.name }
              }
              return p
            })
          })
          setMasterGroup(prev => {
            return prev.map(p => {
              if (p.id === typeId) {
                return { ...p, name: group.name }
              }
              return p
            })
          })
          setGroup(null)
          return setSnackWarning(prev => ({
            ...prev,
            show: true,
            message: 'Group name updated!',
            severity: 'success',
          }))
        } else {
          // create
          window.location.reload()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchData(formFilterOptions, page, row, isReload = false) {
    setDataList(prev => ({
      ...DEFAULT_DATA_LIST_STATE,
      total: prev.total || DEFAULT_DATA_LIST_STATE.total,
    }))

    const resGroup = await axios.get(API.USER_GROUP)
    setMasterGroup(
      resGroup.data.data.map(n => ({
        name: n.name,
        id: n.id,
      }))
    )

    let params = {
      typeId,
      rowsPerPage: row || rowsPerPage,
      pageNum: page || pageNum,
    }

    let filters = formFilterOptions || stateFilterOptions || {}

    if (!isReload) {
      params = { ...params, ...filters }
    }

    try {
      const resUser = await axios.get(API.USER_BY_GROUP, {
        params,
      })

      let newObj = objectArrayToCamel(resUser.data.data)
      // console.log(newObj)

      setDataList({ ...dataList, data: newObj, total: resUser.data.total })
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
    // setDataList(DEFAULT_DATA_LIST_STATE)
    setStateFilterOptions(null)
    setPageNum(1)
    const isReload = true
    fetchData(null, 1, rowsPerPage, isReload)
  }

  async function handleCreateClick() {
    setSelected({
      radCode: '',
      radDescription: '',
      radDescriptionEng: '',
      radUserName: '',
      radUserId: '',
      // radPassword: '',
      radRePassword: '',
      radType: typeId,
      isCreate: true,
    })
    setOpen(true)
  }

  async function handleCreateGroupClick() {
    setOpen(true)
    setGroup({
      id: null,
      name: '',
      isCreate: true,
    })
  }

  async function handleEditGroupClick() {
    try {
      setOpen(true)
      const response = await axios.get(API.USER_GROUP)
      setGroup({
        id: typeId,
        name: response.data.data.find(g => g.id === typeId).name,
        isCreate: false,
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function handleEditPermissionClick() {
    try {
      const response = await axios.get(API.PERMISSION, {
        params: {
          id: typeId,
        },
      })

      const p = objNullToZero(response.data.data)
      const permissionGroup = makePermissionGroup(p)
      setPermissionGroupForm(permissionGroup)
      setPermission(p)
      setOpen(true)
    } catch (error) {
      console.log(error)
    }
  }

  async function handleRemoveGroupClick() {
    try {
      const conf = window.confirm(
        `Confirm to delete "${
          masterGroup.find(g => g.id === typeId).name
        }" group and all users in this group ?`
      )
      if (conf) {
        // delete group
        const response = await axios.delete(API.USER_GROUP, {
          params: {
            id: typeId,
          },
        })

        if (response.data.data.result) {
          window.location.reload()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleResetPasswordClick() {
    const userCode = rowSelected.map(r => r.radCode) || []

    if (userCode.length === 0) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select minimum 1 record you want to reset password',
        severity: 'warning',
      }))
    }

    if (!window.confirm('Confirm to reset?')) return

    try {
      const response = await axios.post(API.RESET_PASSWORD, {
        userCode,
      })

      if (response.data.data.result) {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Reset password completed',
          severity: 'success',
        }))
        // handleReloadClick()
      } else {
        setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Error, reset fail',
          severity: 'error',
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleEditClick(params) {
    // setSelected({ ...params.row, radRePassword: params.row.radPassword })
    setSelected(params.row)
    setOpen(true)
  }

  async function handleRemoveClick() {
    const userCode = rowSelected.map(r => r.radCode) || []

    if (userCode.length === 0) {
      return setSnackWarning(prev => ({
        ...prev,
        show: true,
        message: 'Select minimum 1 record you want to delete',
        severity: 'warning',
      }))
    }

    if (!window.confirm('Confirm to delete?')) return

    try {
      const response = await axios.delete(API.USER, {
        params: {
          userCode: userCode.join(','),
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

  function handlePermissionChange(e) {
    const { name, checked } = e.target

    setPermission(prev => ({ ...prev, [name]: checked ? '1' : '0' }))
  }

  const btr = {
    mr: 0.5,
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
            startIcon={<PersonAddIcon />}
          >
            Create
          </Button>
          {/* {typeId !== 1 && ( */}
          <Button
            onClick={handleRemoveClick}
            variant='contained'
            color='error'
            sx={{
              ...btr,
            }}
            startIcon={<PersonRemoveAlt1Icon />}
          >
            Remove
          </Button>
          {user?.allowUserGroupConfig === '1' && (
            <Button
              onClick={handleResetPasswordClick}
              variant='contained'
              sx={{
                ...btr,
                ...btStyle,
              }}
              startIcon={<LockResetIcon />}
            >
              Reset Password
            </Button>
          )}
          {/* )}*/}
          {![0, 1].includes(typeId) && user?.allowUserGroupConfig === '1' && (
            <Button
              onClick={handleEditGroupClick}
              variant='contained'
              sx={{
                ...btr,
                ...btStyle,
              }}
              startIcon={<EditIcon />}
            >
              Group Name
            </Button>
          )}
          {typeId !== 0 && user?.allowUserGroupConfig === '1' && (
            <Button
              onClick={handleEditPermissionClick}
              variant='contained'
              sx={{
                ...btr,
                ...btStyle,
              }}
              startIcon={<LockOpenIcon />}
            >
              Permission
            </Button>
          )}
          {/* {![1, 2, 3, 4, 0].includes(typeId) &&
            user?.allowUserGroupConfig === '1' && (
              <Button
                onClick={handleRemoveGroupClick}
                variant='contained'
                sx={{
                  ...btr,
                }}
                startIcon={<RemoveIcon />}
                color='error'
              >
                Remove Group
              </Button>
            )} */}
        </div>
        <form ref={qFormRef} onSubmit={handleQuickSearch} autoComplete='off'>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            margin='dense'
            InputProps={{
              placeholder: 'User ID, Name...',
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
      {/* {!dataList.data && <SkeletonLoading style={{ mt: 0 }} />} */}
      <SkeletonLoading loading={dataList.data == null} style={{ mt: 0 }} />

      {dataList.data && (
        <Fade in={dataList?.data ? true : false} timeout={200}>
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
              // checkboxSelection={typeId !== 1}
              checkboxSelection
              // isRowSelectable={params => params.row.radType !== '1'}
              isRowSelectable={params => params.row.radCode !== 'admin'}
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
                // minHeight: 405,
                // minHeight: minHeight,
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
      {group && (
        <div>
          <Dialog
            open={open}
            onClose={handleCloseGroup}
            maxWidth={'xs'}
            fullWidth
          >
            <DialogTitle sx={dialogTitleStyle}>
              {group.isCreate ? 'Create New' : 'Edit'} Group
            </DialogTitle>
            <Divider />
            <DialogContent
              sx={{
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <TextField
                sx={inputStyle2}
                autoFocus
                label='Group Name *'
                value={group.name || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setGroup(prev => ({ ...prev, name: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </DialogContent>
            <DialogActions
              sx={{
                pr: 3,
                pb: 2,
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <Button onClick={handleCloseGroup} variant='outlined'>
                Cancel
              </Button>
              <Button
                sx={btStyle}
                onClick={handleSaveGroup}
                variant='contained'
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
      {permission && permissionGroupForm && (
        <div>
          <Dialog
            open={open}
            onClose={handleClosePermission}
            maxWidth={'sm'}
            fullWidth
          >
            <DialogTitle sx={dialogTitleStyle}>
              {masterGroup.find(g => g.id === typeId).name} Permission
            </DialogTitle>
            <Divider />
            <DialogContent
              sx={{
                mt: 0,
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <List
                sx={{
                  p: 0,
                  m: 0,
                }}
              >
                {permissionGroupForm.map(form => {
                  return (
                    <div key={form.name}>
                      <ListItem
                        disablePadding
                        sx={{
                          pl: 1,
                          bgcolor: form.main
                            ? theme =>
                                theme.palette.mode === 'dark'
                                  ? permissionHeaderColor
                                  : MODE.light.dataGrid.headerBackground
                            : undefined,
                        }}
                      >
                        <FormGroup>
                          <FormControlLabel
                            checked={permission[form.name] === '1'}
                            control={<Checkbox />}
                            label={form.label}
                            name={form.name}
                            onChange={handlePermissionChange}
                          />
                        </FormGroup>
                      </ListItem>
                      {form.sub?.map(form => {
                        return (
                          <div key={form.name}>
                            <ListItem
                              key={form.name}
                              disablePadding
                              sx={{
                                pl: 4,
                              }}
                            >
                              <FormGroup>
                                <FormControlLabel
                                  checked={permission[form.name] === '1'}
                                  control={<Checkbox />}
                                  label={form.label}
                                  name={form.name}
                                  onChange={handlePermissionChange}
                                />
                              </FormGroup>
                            </ListItem>
                            {form.sub?.map(form => {
                              return (
                                <ListItem
                                  key={form.name}
                                  disablePadding
                                  sx={{
                                    pl: 8,
                                  }}
                                >
                                  <FormGroup>
                                    <FormControlLabel
                                      title={`${
                                        form.required ? 'Required field' : ''
                                      }`}
                                      checked={permission[form.name] === '1'}
                                      control={<Checkbox />}
                                      disabled={form.required}
                                      label={`${form.label} ${
                                        form.required ? '*' : ''
                                      }`}
                                      name={form.name}
                                      onChange={handlePermissionChange}
                                    />
                                  </FormGroup>
                                </ListItem>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </List>
            </DialogContent>
            <DialogActions
              sx={{
                pr: 3,
                pb: 2,
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <Button onClick={handleClosePermission} variant='outlined'>
                Cancel
              </Button>
              <Button
                sx={btStyle}
                onClick={handleSavePermission}
                variant='contained'
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
      {selected && (
        <>
          <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth>
            <DialogTitle sx={dialogTitleStyle}>
              {selected.isCreate ? 'Create New' : 'Edit'} User
            </DialogTitle>
            <Divider />
            <DialogContent
              sx={{
                bgcolor: theme => MODE[theme.palette.mode].dialog.body,
              }}
            >
              <TextField
                label='User ID *'
                autoFocus={!selected.radCode ? true : false}
                defaultValue={selected.radCode}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                InputProps={{
                  readOnly: !selected.isCreate ? true : false,
                }}
                error={error.radCode}
                helperText={
                  error.radCode && `> ${selected.radCode} ${error.helpertext}`
                }
                onKeyDown={() =>
                  setError(prev => ({ ...prev, radCode: false }))
                }
                onBlur={e => {
                  if (selected.isCreate) {
                    if (e.target.value) {
                      checkIsExist({
                        table: 'RIS_RADIOLOGIST',
                        column: 'RAD_CODE',
                        value: e.target.value,
                      })

                      checkIsExist({
                        table: 'RIS_RADIOLOGIST',
                        column: 'RAD_USER_ID',
                        value: e.target.value,
                      })
                    }
                  }
                }}
                onChange={e => {
                  if (selected.isCreate) {
                    setSelected(prev => ({
                      ...prev,
                      radCode: e.target.value,
                      radName: e.target.value,
                      radUserId: e.target.value,
                      radUserName: e.target.value,
                    }))
                  }
                }}
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='Name TH *'
                value={selected.radDescription || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    radDescription: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='Name EN'
                value={selected.radDescriptionEng || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    radDescriptionEng: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='Medical License'
                value={selected.radUserName || ''}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    radUserName: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />
              <TextField
                label='Care Provider *'
                value={selected.radUserId}
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                InputProps={{
                  readOnly: !selected.isCreate ? true : false,
                  autoComplete: 'new-password',
                }}
                error={error.radUserId}
                helperText={
                  error.radUserId &&
                  `> ${selected.radUserId} ${error.helpertext}`
                }
                onKeyDown={() =>
                  setError(prev => ({ ...prev, radUserId: false }))
                }
                onBlur={e => {
                  if (selected.isCreate) {
                    checkIsExist({
                      table: 'RIS_RADIOLOGIST',
                      column: 'RAD_USER_ID',
                      value: e.target.value,
                    })
                  }
                }}
                onChange={e => {
                  if (selected.isCreate) {
                    setSelected(prev => ({
                      ...prev,
                      radUserId: e.target.value,
                    }))
                  }
                }}
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              />

              {/* <TextField
                label='Password *'
                value={selected.radPassword || ''}
                margin='dense'
                type='password'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    radPassword: e.target.value,
                  }))
                }
                InputProps={{
                  autoComplete: 'new-password',
                }}
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              /> */}
              {/* <TextField
                label='Confirm Password *'
                value={selected.radRePassword || ''}
                margin='dense'
                type='password'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected(prev => ({
                    ...prev,
                    radRePassword: e.target.value,
                  }))
                }
                InputLabelProps={{ shrink: true }}
                sx={inputStyle2}
              /> */}

              <Divider />

              <FormControl
                sx={{ ...inputStyle2, width: '100%', mt: 2 }}
                size='small'
              >
                <InputLabel>Group</InputLabel>
                <Select
                  label='Group'
                  fullWidth
                  value={selected.radType}
                  onChange={e =>
                    setSelected(prev => ({
                      ...prev,
                      radType: e.target.value,
                    }))
                  }
                >
                  {masterGroup.map(g => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name}
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
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 80,
          display: user?.allowUserGroupConfig === '1' ? undefined : 'none',
        }}
      >
        <IconButton
          title='Create New Group'
          sx={{
            boxShadow: 10,
            border: theme =>
              theme.palette.mode === 'dark'
                ? '1px solid #6c6c6c'
                : '1px solid #e0e0e0',
            color: theme => (theme.palette.mode === 'dark' ? 'white' : '#333'),
            bgcolor: theme =>
              theme.palette.mode === 'dark' ? undefined : 'white',
          }}
          size='medium'
          onClick={handleCreateGroupClick}
        >
          <GroupAddIcon fontSize='large' sx={{ fontSize: 40 }} />
        </IconButton>
      </div>
      {![1, 2, 3, 4, 0].includes(typeId) &&
        // tabName.toLowerCase().indexOf('tech') < 0 &&
        typeId !== 0 &&
        user?.allowUserGroupConfig === '1' && (
          <div
            style={{
              position: 'absolute',
              right: 20,
              top: 160,
              display: user?.allowUserGroupConfig === '1' ? undefined : 'none',
            }}
          >
            <IconButton
              title='Delete Group'
              disableRipple
              sx={{
                boxShadow: 5,
                color: 'white',
                bgcolor: theme =>
                  theme.palette.mode === 'dark' ? '#D2122E' : '#E32636',
              }}
              size='medium'
              onClick={handleRemoveGroupClick}
            >
              <GroupRemoveIcon
                fontSize='large'
                sx={{
                  fontSize: 40,
                }}
              />
            </IconButton>
          </div>
        )}
    </>
  )
}

export default RenderTab
