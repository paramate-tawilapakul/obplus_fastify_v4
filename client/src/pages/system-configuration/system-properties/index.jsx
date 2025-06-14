import { useEffect, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import EditIcon from '@mui/icons-material/Edit'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import SaveIcon from '@mui/icons-material/Save'
import Fade from '@mui/material/Fade'

import Layout from '../../../components/layout/Layout'
import BackButton from '../button'
import { API, MODE, reqHeader } from '../../../config'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import { checkLogin, hasPermission } from '../../../utils'
import DataContext from '../../../context/data/dataContext'
import { inputStyle2, btStyle } from '../../../components/page-tools/form-style'

const Index = () => {
  const { user } = useContext(DataContext)
  const history = useHistory()
  const [rows, setRows] = useState([])
  const defaultSelected = { name: '', value: '', id: 0 }
  const [selected, setSelected] = useState(defaultSelected)
  const [open, setOpen] = useState(false)
  const optionCondition = ['enable', 'disable']
  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 2000,
    severity: null,
  })

  useEffect(() => {
    checkLogin()

    if (user) {
      hasPermission('allowSystemPropertiesConfig', history, user, 'setting')
      fetchData()
    }

    return () => {}

    // eslint-disable-next-line
  }, [user])

  const handleClickOpen = obj => {
    setSelected(obj)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    // setSelected(defaultSelected)
  }

  const handleSave = async () => {
    setOpen(false)
    // save to db
    const response = await axios.post(API.SYS_PROPERTIES, selected, reqHeader)

    // update rows
    if (response.data.data.result) {
      setRows(prev => {
        const newObj = prev.map(p => {
          if (p.id === selected.id) {
            return { ...selected, value: selected.value.trim() }
          }
          return p
        })
        return newObj
      })

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
  }

  async function fetchData() {
    try {
      const response = await axios.get(API.SYS_PROPERTIES)

      setRows(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Layout>
      <BackButton />
      <Grid container spacing={2} sx={{ px: 14, pt: 1 }}>
        <Grid item xs={12}>
          <Fade in={rows.length > 0 ? true : false}>
            <div>
              <TableContainer component={Paper} sx={{ maxWidth: 950 }}>
                <Table aria-label='simple table' size='small'>
                  <TableHead
                    sx={{
                      bgcolor: theme =>
                        MODE[theme.palette.mode].dataGrid.headerBackground,
                    }}
                  >
                    <TableRow>
                      <TableCell sx={{ minWidth: 280 }}>Name</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      bgcolor: theme => MODE[theme.palette.mode].tab.background,
                    }}
                  >
                    {rows.length > 0 &&
                      rows.map(row => (
                        <TableRow
                          key={row.name}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            // '&:nth-of-type(odd)': {
                            //   bgcolor: theme => theme.palette.action.hover,
                            // },
                            ':hover': {
                              bgcolor: theme =>
                                MODE[theme.palette.mode].dataGrid.rowHover,
                            },
                          }}
                        >
                          <TableCell sx={{ fontSize: 16 }}>
                            {row.name}
                          </TableCell>
                          <TableCell>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ marginTop: 2, fontSize: 16 }}>
                                {row.value}
                              </div>

                              <EditIcon
                                style={{ cursor: 'pointer' }}
                                titleAccess={`Edit -> ${row.name}`}
                                onClick={() => handleClickOpen(row)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Fade>
        </Grid>
      </Grid>

      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth={!optionCondition.includes(selected.value)}
          maxWidth={!optionCondition.includes(selected.value) ? 'sm' : ''}
        >
          <DialogTitle>{selected.name}</DialogTitle>
          <DialogContent>
            {optionCondition.includes(selected.value) ? (
              <FormControl sx={{ ...inputStyle2, minWidth: 200 }} size='small'>
                <Select
                  fullWidth
                  value={selected.value}
                  onChange={e =>
                    setSelected({ ...selected, value: e.target.value })
                  }
                >
                  <MenuItem value='enable'>enable</MenuItem>
                  <MenuItem value='disable'>disable</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                value={selected.value}
                autoFocus
                margin='dense'
                type='text'
                fullWidth
                variant='outlined'
                size='small'
                onChange={e =>
                  setSelected({ ...selected, value: e.target.value })
                }
                sx={inputStyle2}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ mr: 2, mb: 2 }}>
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
      </div>

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </Layout>
  )
}

export default Index
