import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import SaveIcon from '@mui/icons-material/Save'

import axios from 'axios'

import { API, reqHeader } from '../../../config'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'
import { inputStyle2, btStyle } from '../../../components/page-tools/form-style'

const defaultSnack = {
  show: false,
  message: 'Save Completed',
  autoHideDuration: 1000,
  severity: 'success',
}

const DefaultDate = () => {
  const [data, setData] = useState(null)
  const [snackWarning, setSnackWarning] = useState(defaultSnack)

  async function getDefaultDate() {
    try {
      const res = await axios.get(API.DEFAULT_DATE_LIST)
      setData({
        sysId: res.data.data[0].sysId,
        date: res.data.data[0].defaultDate,
        list: res.data.data[0].defaultList,
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function handleUpdate() {
    try {
      const res = await axios.put(API.DEFAULT_DATE_LIST, data, reqHeader)

      if (res.data.data.result) setSnackWarning({ ...defaultSnack, show: true })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getDefaultDate()
  }, [])

  return (
    data && (
      <div style={{ padding: '8px 15px 0 15px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 100, marginTop: 7 }}>Default Date </div>
          <TextField
            size='small'
            sx={{ ...inputStyle2, width: 100 }}
            value={data.date}
            onChange={e =>
              setData(prev => ({
                ...prev,
                date: e.target.value,
              }))
            }
          />
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 100, marginTop: 15 }}>Default List </div>
          <FormControl sx={{ ...inputStyle2, width: 100, mt: 1 }} size='small'>
            <Select
              value={data.list}
              onChange={e =>
                setData(prev => ({
                  ...prev,
                  list: e.target.value,
                }))
              }
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
              <MenuItem value='100'>100</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button
          variant='contained'
          sx={{ ...btStyle, mt: 2 }}
          onClick={handleUpdate}
          startIcon={<SaveIcon />}
        >
          Save
        </Button>

        <SnackBarWarning
          snackWarning={snackWarning}
          setSnackWarning={setSnackWarning}
          vertical='top'
          horizontal='center'
        />
      </div>
    )
  )
}

export default DefaultDate
