import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import useTheme from '@mui/material/styles/useTheme'

import { API, STORAGE_NAME, TEMPLATES, REPORT_ID } from '../../../../config'
import {
  btStyle,
  dialogTitleStyle,
} from '../../../../components/page-tools/form-style'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import { getReportId, getRiD, randomMs } from '../../helper'
import { formDataToObject, reFormatNumber, sleep } from '../../../../utils'
import { qs, qsa } from '../../../../utils/domUtils'

const templateId = TEMPLATES.fibroids.id

const unit = u => (
  <Box
    sx={{
      display: 'inline',
      color: theme => (theme.palette.mode === 'dark' ? 'lightblue' : 'blue'),
    }}
  >
    {u}
  </Box>
)

const Fibroids = ({ patient, open, setOpen, callback }) => {
  const theme = useTheme()
  const inputStyle = {
    paddingRight: '3px',
    textAlign: 'right',
    //   width: '35px',
    width: '100%',
    height: '28px',
    borderRadius: '3px',
    backgroundColor: theme.palette.mode === 'dark' ? '#606060' : '#f9f9f9',
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    border:
      theme.palette.mode === 'dark' ? '1px #01796f solid' : '1px #ccc solid',
  }
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [loading, setLoading] = useState(false)
  const formRef = useRef(null)

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: null,
  })

  useEffect(() => {
    if (open) {
      initData()
    }

    return () => {}
    // eslint-disable-next-line
  }, [open])

  function handleClose() {
    setOpen(false)
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.fibroids.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.fibroids.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.fibroids.name, patient.currentFetus),
        },
      })
      //   console.log(res.data.data)
      setData(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    try {
      const res = await axios.get(API.REPORT_FORM, {
        params: {
          templateId,
        },
      })
      const form = res.data.data
      //   console.log(form)
      let formSend = {}
      form.forEach(f => {
        formSend[f.valueId] = {
          type: f.type,
          value: '',
        }
      })
      Object.keys(formSend).forEach(key => {
        const t = data.find(d => d.refValueId == key)
        if (t) {
          formSend[key].value =
            !t.contentOption || t.contentOption === 0
              ? t.content
              : t.contentOption
        }
      })
      formSend['reportId'] = getRiD(
        TEMPLATES.fibroids.name,
        patient.currentFetus
      )

      setDataForm(form)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  async function saveData(e) {
    e?.preventDefault()
    // console.log(dataForm)
    const formData = formRef.current
    const data = qsa(['input', 'select'], formData)
    const formObj = formDataToObject(data)
    let newArr = []
    let index = 1
    let temp = {}
    let count = 0
    Object.keys(formObj).forEach(key => {
      ++count
      temp = {
        ...temp,
        [`${index === 10 ? key.slice(0, -3) : key.slice(0, -2)}`]: formObj[key],
      }

      if (count === 7) {
        count = 0
        newArr.push(temp)
        temp = {}
        index++
      }
    })

    // console.log(newArr)
    let newForm = {}
    let isEmpty = true
    dataForm.forEach((form, i) => {
      Object.keys(newArr[i]).forEach(key => {
        if (newArr[i][key]) isEmpty = false
      })

      if (!isEmpty) {
        // console.log(`row ${i} has data`)
        newForm[form['valueId']] = {
          type: 'T',
          value: Object.keys(newArr[i])
            .map(key => newArr[i][key])
            .join('-'),
        }
      }

      isEmpty = true
    })

    // console.log(newForm)

    try {
      const res = await axios.post(API.REPORT_CONTENT, {
        reportData: {
          ...newForm,
          reportId: getRiD(TEMPLATES.fibroids.name, patient.currentFetus),
        },
      })

      if (!res.data.data) {
        return setSnackWarning(prev => ({
          ...prev,
          show: true,
          message: 'Save Fail!',
          severity: 'error',
        }))
      }
      callback()
      handleClose()
    } catch (error) {
      console.log(error)
    }
  }

  function calculateVolume(index) {
    const pattern = /^[0-9.]*$/

    const formData = formRef.current
    const d1 = qs(`input[name="d1_${index}"]`, formData)
    const d2 = qs(`input[name="d2_${index}"]`, formData)
    const d3 = qs(`input[name="d3_${index}"]`, formData)
    const check = [d1.value.trim(), d2.value.trim(), d3.value.trim()]
    let pass = true

    for (let i = 0; i < 3; i++) {
      if (!pattern.test(check[i])) {
        pass = false
        if (i === 0) d1.value = ''
        else if (i === 1) d2.value = ''
        else if (i === 2) d3.value = ''
        break
      }
    }

    if (!pass) return alert('only number and .')

    const volumn = qs(`input[name="volumn_${index}"]`, formData)

    if (d1.value && d2.value && d3.value) {
      let multipy = [
        parseFloat(d1.value),
        parseFloat(d2.value),
        parseFloat(d3.value),
      ].reduce((a, b) => a * b, 1)

      volumn.value = reFormatNumber(multipy)
    } else {
      volumn.value = ''
    }
  }

  return (
    <>
      {!loading && (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth={'lg'}
          // sx={{ width: 800 }}
          // fullWidth
        >
          <DialogTitle
            sx={{
              ...dialogTitleStyle,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>Fibroids</div>
            <CloseIcon
              sx={{ mr: 1.5, cursor: 'pointer' }}
              onClick={handleClose}
            />
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ m: 1, p: 0 }}>
            <form ref={formRef} autoComplete='off'>
              <table cellSpacing={4} cellPadding={4}>
                <thead>
                  <tr>
                    <td style={{ width: 30 }}>No.</td>
                    <td style={{ width: 65, whiteSpace: 'nowrap' }}>
                      D1({unit('cm')})
                    </td>
                    <td style={{ width: 65, whiteSpace: 'nowrap' }}>
                      D2({unit('cm')})
                    </td>
                    <td style={{ width: 65, whiteSpace: 'nowrap' }}>
                      D3({unit('cm')})
                    </td>
                    <td style={{ width: 95, whiteSpace: 'nowrap' }}>
                      Volume({unit('ml')})
                    </td>
                    <td style={{ width: 180 }}>Type</td>
                    <td style={{ width: 200 }}>Position</td>
                    <td style={{ width: 200 }}></td>
                  </tr>
                </thead>
                <tbody>
                  {dataForm.length > 0 &&
                    dataForm.map((form, i) => {
                      let value = ['', '', '', '', '', '', '']

                      const test = data.find(
                        data => data.refValueId === form.valueId
                      )
                      if (test && test.content) value = test.content.split('-')

                      //   console.log(value)

                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <input
                              name={`d1_${i + 1}`}
                              type='text'
                              style={{ ...inputStyle }}
                              defaultValue={value[0] || ''}
                              onChange={() => calculateVolume(i + 1)}
                            />
                          </td>
                          <td>
                            <input
                              name={`d2_${i + 1}`}
                              type='text'
                              style={{ ...inputStyle }}
                              defaultValue={value[1] || ''}
                              onChange={() => calculateVolume(i + 1)}
                            />
                          </td>
                          <td>
                            <input
                              name={`d3_${i + 1}`}
                              type='text'
                              style={{ ...inputStyle }}
                              defaultValue={value[2] || ''}
                              onChange={() => calculateVolume(i + 1)}
                            />
                          </td>
                          <td>
                            <input
                              name={`volumn_${i + 1}`}
                              type='text'
                              style={{ ...inputStyle }}
                              defaultValue={value[3] || ''}
                              readOnly={true}
                            />
                          </td>
                          <td>
                            <select
                              name={`type_${i + 1}`}
                              style={{
                                ...inputStyle,
                                textAlign: 'left',
                              }}
                              defaultValue={value[4] || ''}
                            >
                              <option value=''></option>
                              <option value='Submucous < 50%'>
                                Submucous &lt; 50%
                              </option>
                              <option value='Submucous > 50%'>
                                Submucous &gt; 50%
                              </option>
                              <option value='Intramural'>Intramural</option>
                              <option value='Subserous'>Subserous</option>
                              <option value='Broad ligament fibroid'>
                                Broad ligament fibroid
                              </option>
                              <option value='Pedunculated'>Pedunculated</option>
                            </select>
                          </td>
                          <td>
                            <select
                              name={`position_${i + 1}`}
                              style={{
                                ...inputStyle,
                                textAlign: 'left',
                              }}
                              defaultValue={value[5] || ''}
                            >
                              <option value=''></option>
                              <option value='Anterior'>Anterior</option>
                              <option value='Posterior'>Posterior</option>
                              <option value='Fundus'>Fundus</option>
                              <option value='Cervix'>Cervix</option>
                              <option value='Right lateral wall'>
                                Right lateral wall
                              </option>
                              <option value='Left lateral wall'>
                                Left lateral wall
                              </option>
                              <option value='Right lateral posterior wall'>
                                Right lateral posterior wall
                              </option>
                              <option value='Left lateral posterior wall'>
                                Left lateral posterior wall
                              </option>
                            </select>
                          </td>
                          <td>
                            <input
                              name={`text_${i + 1}`}
                              type='text'
                              style={{
                                ...inputStyle,
                                textAlign: 'left',
                              }}
                              defaultValue={value[6] || ''}
                            />
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{ ...btStyle, mr: 1.1, mb: 1 }}
              onClick={saveData}
              variant='contained'
              startIcon={<CheckIcon />}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
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

export default Fibroids
