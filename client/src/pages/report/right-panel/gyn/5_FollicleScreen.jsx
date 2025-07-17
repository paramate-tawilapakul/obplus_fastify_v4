import { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { parseISO } from 'date-fns'
import useTheme from '@mui/material/styles/useTheme'

import { API, TEMPLATES, REPORT_ID } from '../../../../config'
import {
  btStyle,
  inputMargin,
  inputStyle,
} from '../../../../components/page-tools/form-style'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import {
  autoSave,
  cleanUpForm,
  getReportId,
  getRiD,
  randomMs,
  updateDataChange,
} from '../../helper'
import { formDataToObject, reFormatNumber, sleep } from '../../../../utils'
import SelectField from '../../../../components/page-tools/SelectField'
import { initFormSend, storeBackupData } from '../../report-utils'
import InputTextField from '../../../../components/page-tools/InputTextField'

import { Divider, Typography } from '@mui/material'
import { qs, qsa } from '../../../../utils/domUtils'
import CommentField from '../../../../components/page-tools/CommentField'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

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

const templateId = TEMPLATES.follicleScreen.id
let backupData = null

const defaultDate = {
  0: {
    name: 'Date of Exam',
    value: null,
  },
  1: {
    name: 'Last period',
    value: null,
  },
}

const FollicleScreen = ({ patient }) => {
  const theme = useTheme()
  const iStyle = {
    paddingRight: '3px',
    textAlign: 'right',
    //   width: '35px',
    width: '100%',
    height: '28px',
    borderRadius: '3px',
    backgroundColor: theme.palette.mode === 'dark' ? '#393939' : '#ffffff',
    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    border:
      theme.palette.mode === 'dark' ? '1px #01796f solid' : '1px #ccc solid',
  }
  const [date, setDate] = useState(defaultDate)
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)

  const cycleInputRef = useRef(null)
  const leftFormRef = useRef(null)
  const rightFormRef = useRef(null)

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: null,
  })

  useEffect(() => {
    resetData()
    initData()
    updateDataChange('0')

    return () => {
      autoSave(backupData)
      backupData = null
    }
    // eslint-disable-next-line
  }, [patient])

  function resetData() {
    setData(null)
    setDataForm([])
    setDataFormSend([])
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.follicleScreen.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.follicleScreen.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.follicleScreen.name, patient.currentFetus),
        },
      })

      setData(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.follicleScreen.name, patient.currentFetus),
      templateId
    )

    let dateObj = defaultDate
    let findDateOfExam = data.find(d => d.refValueId === 529)
    if (findDateOfExam) {
      dateObj = {
        ...dateObj,
        0: {
          ...dateObj['0'],
          value: parseISO(findDateOfExam.content),
        },
      }
    }

    let findDatePeriod = data.find(d => d.refValueId === 530)
    if (findDatePeriod) {
      dateObj = {
        ...dateObj,
        1: {
          ...dateObj['1'],
          value: parseISO(findDatePeriod.content),
        },
      }
    }

    setDate(dateObj)

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d, newValue) {
    updateDataChange('1')

    // console.log(d.type, newValue)
    let v = newValue
      ? moment(newValue).format('YYYYMMDD')
      : e
      ? e.target.value
      : ''

    setDataFormSend(prev => {
      const temp = {
        ...prev,
        [d.valueId]: {
          ...prev[d.valueId],
          value: v,
        },
      }

      if (temp['529'].value && temp['530'].value) {
        const cycle = (
          moment
            .duration(moment(temp['529'].value).diff(temp['530'].value))
            .asDays() + 1
        ).toString()

        temp['531'] = { type: 'T', value: cycle }
        // console.log(cycle)
        cycleInputRef.current.value = cycle
      }

      if (!temp['529'].value || !temp['530'].value) {
        cycleInputRef.current.value = ''
        temp['531'] = { type: 'T', value: '' }
      }

      // console.log(temp)
      backupData = temp
      storeBackupData(temp)
      return temp
    })
  }

  function handleFollicleChange() {
    updateDataChange('1')
    for (let i = 535; i <= 554; i++) {
      delete backupData[i]
    }
    backupData = { ...backupData, ...handleFollicleData() }
    storeBackupData(backupData)
  }

  function handleFollicleData() {
    const formData1 = leftFormRef.current
    const formData2 = rightFormRef.current
    const data1 = qsa(['input'], formData1)
    const formObj1 = formDataToObject(data1)
    const data2 = qsa(['input'], formData2)
    const formObj2 = formDataToObject(data2)
    let follicleForm = {}
    let isEmpty = true
    let newArr = []
    let index = 1
    let temp = {}
    let count = 0
    Object.keys(formObj1).forEach(key => {
      ++count
      temp = {
        ...temp,
        [`${index === 10 ? key.slice(0, -3) : key.slice(0, -2)}`]:
          formObj1[key],
      }

      if (count === 4) {
        count = 0
        newArr.push(temp)
        temp = {}
        index++
      }
    })

    dataForm.slice(6, 16).forEach((form, i) => {
      Object.keys(newArr[i]).forEach(key => {
        if (newArr[i][key]) isEmpty = false
      })

      if (!isEmpty) {
        // console.log(`row ${i} has data`)
        follicleForm[form['valueId']] = {
          type: 'T',
          value: Object.keys(newArr[i])
            .map(key => newArr[i][key])
            .join('-'),
        }
      }

      isEmpty = true
    })

    isEmpty = true
    newArr = []
    index = 1
    temp = {}
    count = 0

    Object.keys(formObj2).forEach(key => {
      ++count
      temp = {
        ...temp,
        [`${index === 10 ? key.slice(0, -3) : key.slice(0, -2)}`]:
          formObj2[key],
      }

      if (count === 4) {
        count = 0
        newArr.push(temp)
        temp = {}
        index++
      }
    })

    dataForm.slice(16).forEach((form, i) => {
      Object.keys(newArr[i]).forEach(key => {
        if (newArr[i][key]) isEmpty = false
      })

      if (!isEmpty) {
        // console.log(`row ${i} has data`)
        follicleForm[form['valueId']] = {
          type: 'T',
          value: Object.keys(newArr[i])
            .map(key => newArr[i][key])
            .join('-'),
        }
      }

      isEmpty = true
    })
    // console.log(follicleForm)
    return follicleForm
  }

  async function saveData() {
    try {
      let newForm = cleanUpForm(dataFormSend)
      newForm = { ...newForm, ...handleFollicleData() }
      /// SAVE TO STORAGE FOR AUTO SAVE BEFORE PREVIEW
      storeBackupData(dataFormSend)

      const res = await axios.post(API.REPORT_CONTENT, { reportData: newForm })
      let message = 'Save Fail!'
      let severity = 'error'

      if (res.data.data) {
        message = 'Save Completed'
        severity = 'success'
        updateDataChange('0')
      }

      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message,
        severity,
      }))
    } catch (error) {
      console.log(error)
    }
  }

  function calculateMean(index, formRef) {
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

    const mean = qs(`input[name="mean_${index}"]`, formData)

    if (d1.value && d2.value && d3.value) {
      let meanValue = [
        parseFloat(d1.value),
        parseFloat(d2.value),
        parseFloat(d3.value),
      ].reduce((a, b) => a + b, 0)
      meanValue = meanValue / 3

      mean.value = reFormatNumber(meanValue)
    } else {
      mean.value = ''
    }
  }

  return (
    <>
      <SkeletonLoading loading={loading} style={{ mt: 0.5 }} />

      <Fade in={!loading ? true : false} timeout={200}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            // justifyContent: 'center',
            width: 800,
            alignContent: 'center',
            marginTop: 10,
            marginLeft: 10,
          }}
        >
          {data &&
            dataForm.length > 0 &&
            dataForm.slice(0, 4).map((form, i) => {
              // console.log(form)
              if (i <= 1) {
                return (
                  <LocalizationProvider dateAdapter={AdapterDateFns} key={i}>
                    <DatePicker
                      slotProps={{
                        actionBar: { actions: ['clear', 'today'] },
                        textField: {
                          size: 'small',
                          name: 'dateFrom',
                          sx: {
                            ...inputStyle,
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                fontSize: 20,
                                // mt: 0,
                              },
                            },
                            mr: 1.5,
                            width: 185,
                          },
                          InputLabelProps: {
                            shrink: true,
                            sx: { fontSize: 20 },
                          },
                        },
                      }}
                      allowSameDateSelection
                      clearable
                      label={date[i].name}
                      value={date[i].value}
                      format='dd/MM/yyyy'
                      onChange={newValue => {
                        setDate(prev => ({
                          ...prev,
                          [i]: {
                            ...prev[i],
                            value: newValue,
                          },
                        }))
                        handleChange(null, form, newValue)
                      }}
                    />
                  </LocalizationProvider>
                )
              }
              if (i === 2) {
                return (
                  <div style={{ marginLeft: 4, marginRight: 15 }} key={i}>
                    <InputTextField
                      inputRef={cycleInputRef}
                      width={185}
                      key={i}
                      value={
                        data.find(d => d.refValueId === 531)?.content || ''
                      }
                      form={form}
                      label='Day of cycle'
                      readOnly={true}
                    />
                  </div>
                )
              }
              if (i === 3) {
                let value = ''
                form.options.forEach(op => {
                  const test = data.find(data => data.contentOption === op.opId)
                  if (test) value = test.contentOption
                })

                return (
                  <SelectField
                    key={i}
                    minWidth={185}
                    value={value}
                    handleChange={e => handleChange(e, form)}
                    form={form}
                  />
                )
              }
            })}

          <div
            style={{
              display: 'flex',
              width: '100%',
              marginTop: 10,
              marginLeft: 5,
            }}
          >
            <div style={{ width: '50%' }}>
              <Typography variant='h6' sx={{ ml: 1 }}>
                Left
              </Typography>
              <form
                ref={leftFormRef}
                onChange={handleFollicleChange}
                autoComplete='off'
              >
                <table cellSpacing={3} cellPadding={3}>
                  <thead>
                    <tr>
                      <td>Follicle</td>
                      <td style={{ whiteSpace: 'nowrap' }}>D1({unit('mm')})</td>
                      <td style={{ whiteSpace: 'nowrap' }}>D2({unit('mm')})</td>
                      <td style={{ whiteSpace: 'nowrap' }}>D3({unit('mm')})</td>
                      <td style={{ whiteSpace: 'nowrap' }}>Mean value</td>
                    </tr>
                    <tr>
                      <td colSpan={5}>
                        <Divider sx={{ mt: -1 }} />
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {dataForm.slice(6, 16).map((form, i) => {
                      // console.log(form.name)
                      let value = ['', '', '', '']

                      const test = data.find(
                        data => data.refValueId === form.valueId
                      )
                      if (test && test.content) value = test.content.split('-')

                      return (
                        <tr key={i}>
                          <td style={{ paddingLeft: 10 }}>{i + 1}</td>
                          <td>
                            <input
                              name={`d1_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 55 }}
                              defaultValue={value[0] || ''}
                              onChange={() => calculateMean(i + 1, leftFormRef)}
                            />
                          </td>
                          <td>
                            <input
                              name={`d2_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 55 }}
                              defaultValue={value[1] || ''}
                              onChange={() => calculateMean(i + 1, leftFormRef)}
                            />
                          </td>
                          <td>
                            <input
                              name={`d3_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 55 }}
                              defaultValue={value[2] || ''}
                              onChange={() => calculateMean(i + 1, leftFormRef)}
                            />
                          </td>
                          <td>
                            <input
                              name={`mean_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 80 }}
                              defaultValue={value[3] || ''}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {data && dataForm && (
                  <CommentField
                    m={1.5}
                    minWidth={360}
                    form={dataForm?.find(f => f.valueId === 533)}
                    value={data?.find(d => d.refValueId === 533)?.content || ''}
                    handleChange={e => {
                      handleChange(
                        e,
                        dataForm?.find(f => f.valueId === 533)
                      )
                    }}
                  />
                )}
              </form>
            </div>
            <div style={{ width: '50%' }}>
              <Typography variant='h6' sx={{ ml: 1 }}>
                Right
              </Typography>
              <form
                ref={rightFormRef}
                onChange={handleFollicleChange}
                autoComplete='off'
              >
                <table cellSpacing={3} cellPadding={3}>
                  <thead>
                    <tr>
                      <td>Follicle</td>
                      <td style={{ whiteSpace: 'nowrap' }}>D1({unit('mm')})</td>
                      <td style={{ whiteSpace: 'nowrap' }}>D2({unit('mm')})</td>
                      <td style={{ whiteSpace: 'nowrap' }}>D3({unit('mm')})</td>
                      <td style={{ whiteSpace: 'nowrap' }}>Mean value</td>
                    </tr>
                    <tr>
                      <td colSpan={5}>
                        <Divider sx={{ mt: -1 }} />
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {dataForm.slice(16).map((form, i) => {
                      // console.log(form.name)
                      let value = ['', '', '', '']

                      const test = data.find(
                        data => data.refValueId === form.valueId
                      )
                      if (test && test.content) value = test.content.split('-')

                      return (
                        <tr key={i}>
                          <td style={{ paddingLeft: 10 }}>{i + 1}</td>
                          <td>
                            <input
                              name={`d1_${i + 1}`}
                              type='text'
                              style={{
                                ...iStyle,
                                width: 55,
                              }}
                              defaultValue={value[0] || ''}
                              onChange={() =>
                                calculateMean(i + 1, rightFormRef)
                              }
                            />
                          </td>
                          <td>
                            <input
                              name={`d2_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 55 }}
                              defaultValue={value[1] || ''}
                              onChange={() =>
                                calculateMean(i + 1, rightFormRef)
                              }
                            />
                          </td>
                          <td>
                            <input
                              name={`d3_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 55 }}
                              defaultValue={value[2] || ''}
                              onChange={() =>
                                calculateMean(i + 1, rightFormRef)
                              }
                            />
                          </td>
                          <td>
                            <input
                              name={`mean_${i + 1}`}
                              type='text'
                              style={{ ...iStyle, width: 80 }}
                              defaultValue={value[3] || ''}
                              readOnly={true}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {data && dataForm && (
                  <CommentField
                    m={1.5}
                    minWidth={360}
                    form={dataForm?.find(f => f.valueId === 534)}
                    value={data?.find(d => d.refValueId === 534)?.content || ''}
                    handleChange={e => {
                      handleChange(
                        e,
                        dataForm?.find(f => f.valueId === 534)
                      )
                    }}
                  />
                )}
              </form>
            </div>
          </div>
          <Button
            sx={{ ...btStyle, m: inputMargin }}
            variant='contained'
            startIcon={<CheckIcon />}
            onClick={() => saveData()}
          >
            Save
          </Button>
        </div>
      </Fade>

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default FollicleScreen
