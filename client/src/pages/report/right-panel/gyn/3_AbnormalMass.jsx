import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
// import useTheme from '@mui/material/styles/useTheme'

import { API, STORAGE_NAME, TEMPLATES, REPORT_ID } from '../../../../config'
import {
  btStyle,
  inputMargin,
} from '../../../../components/page-tools/form-style'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import {
  autoSave,
  cleanUpForm,
  getReportId,
  getRiD,
  randomMs,
  replaceNewLineWithBr,
  updateDataChange,
} from '../../helper'
import { sleep } from '../../../../utils'
import CommentField from '../../../../components/page-tools/CommentField'
import SelectField from '../../../../components/page-tools/SelectField'
import InputTextField from '../../../../components/page-tools/InputTextField'
import { initFormSend, storeBackupData } from '../../report-utils'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const templateId = TEMPLATES.abnormalMass.id
let backupData = null

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

let sizeArr = ['', '', '']
const AbnormalMass = ({ patient }) => {
  // const theme = useTheme()
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCyst, setShowCyst] = useState(false)
  const [showSolid, setShowSolid] = useState(false)

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
      if (!REPORT_ID[TEMPLATES.abnormalMass.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.abnormalMass.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.abnormalMass.name, patient.currentFetus),
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
      getRiD(TEMPLATES.abnormalMass.name, patient.currentFetus),
      templateId
    )

    // sizeArr
    let hasSize = data.find(d => d.refValueId === 512)

    if (hasSize) {
      hasSize = hasSize.content.split('*')
      sizeArr = hasSize
    }
    // console.log(data)
    let hasCystContent = data.find(d => d.contentOption === 502)
    if (hasCystContent) {
      setShowCyst(true)
    }

    let hasSolidContent = data.find(d => [503, 504].includes(d.contentOption))
    if (hasSolidContent) {
      setShowSolid(true)
    }

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d, size) {
    updateDataChange('1')

    // console.log(d.type, e.target.value)
    let v =
      d.type === 'A' ? replaceNewLineWithBr(e.target.value) : e.target.value

    setDataFormSend(prev => {
      const temp = {
        ...prev,
        [d.valueId]: {
          ...prev[d.valueId],
          value: v,
        },
      }

      if (d.type === 'C') {
        temp[d.valueId] = { type: 'T', value: e.target.checked ? d.name : '' }
      }

      if (typeof size === 'number') {
        sizeArr[size] = v
        // console.log(sizeArr)
        let test = sizeArr.join('*')
        if (test === '**') test = ''
        temp['512'].value = test
      }

      if (v === 502) {
        setShowCyst(true)
      } else if (d.valueId === 514 && v !== 502) {
        setShowCyst(false)
        for (let i = 515; i <= 520; i++) {
          temp[i + ''].value = ''
        }

        setData(prev =>
          prev.filter(p => !(p.refValueId >= 515 && p.refValueId <= 520))
        )
      }

      if ([503, 504].includes(v)) {
        setShowSolid(true)
      } else if (d.valueId === 514 && v !== 503 && v !== 504) {
        setShowSolid(false)
        for (let i = 521; i <= 522; i++) {
          temp[i + ''].value = ''
        }

        setData(prev => prev.filter(p => ![521, 522].includes(p.refValueId)))
      }

      // console.log(temp)
      backupData = temp
      storeBackupData(temp)
      return temp
    })
  }

  async function saveData() {
    try {
      let newForm = cleanUpForm(dataFormSend)
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

  return (
    <>
      <SkeletonLoading loading={loading} style={{ mt: 0.5 }} />

      <Fade in={!loading ? true : false} timeout={200}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: 500,
            marginTop: 3,
            marginLeft: 10,
          }}
        >
          {dataForm.length > 0 &&
            dataForm.slice(0, 3).map((form, i) => {
              let value = ''

              if (form.type === 'S') {
                form.options.forEach(op => {
                  const test = data.find(data => data.contentOption === op.opId)
                  if (test) value = test.contentOption
                })

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <SelectField
                      minWidth={420}
                      value={value}
                      handleChange={e => handleChange(e, form)}
                      form={form}
                    />
                  </Box>
                )
              } else if (form.type === 'A') {
                const test = data.find(data => data.refValueId === form.valueId)
                if (test && test.content) value = test.content

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <CommentField
                      minWidth={420}
                      form={form}
                      value={value}
                      handleChange={e => handleChange(e, form)}
                    />
                  </Box>
                )
              } else if (form.type === 'T') {
                const test = data.find(data => data.refValueId === form.valueId)
                if (test && test.content) value = test.content

                if (form.valueId === 512) {
                  value = value.split('*')
                  return (
                    <Box
                      key={i}
                      sx={{
                        m: inputMargin,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ marginRight: 5 }}>
                        Size (W*L*H) ({unit('mm')})
                      </div>
                      <InputTextField
                        width={87}
                        form={form}
                        value={value[0] || ''}
                        handleChange={e => handleChange(e, form, 0)}
                        label='Width'
                        sx={{ mr: 1 }}
                      />
                      <InputTextField
                        width={87}
                        form={form}
                        value={value[1] || ''}
                        handleChange={e => handleChange(e, form, 1)}
                        label='Length'
                        sx={{ mr: 1 }}
                      />
                      <InputTextField
                        width={87}
                        form={form}
                        value={value[2] || ''}
                        handleChange={e => handleChange(e, form, 2)}
                        label='Height'
                      />
                    </Box>
                  )
                }

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <InputTextField
                      minWidth={673}
                      form={form}
                      value={value}
                      handleChange={e => handleChange(e, form)}
                    />
                  </Box>
                )
              }
            })}

          {showCyst && (
            <fieldset
              style={{
                // backgroundColor:
                //   theme.palette.mode === 'light' ? 'white' : '#393939',
                border: '1px solid #CCC',
                borderRadius: '4px',
                paddingLeft: '8px',
                marginLeft: 7,
                marginBottom: 10,
              }}
            >
              <legend
                style={{
                  paddingLeft: 5,
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Cyst Content
              </legend>
              {dataForm.length > 0 &&
                dataForm.slice(3, 9).map((form, i) => {
                  let value = ''
                  if (form.type === 'S') {
                    form.options.forEach(op => {
                      const test = data.find(
                        data => data.contentOption === op.opId
                      )
                      if (test) value = test.contentOption
                    })

                    return (
                      <Box key={i} sx={{ m: inputMargin, mt: 2 }}>
                        <SelectField
                          minWidth={406}
                          value={value}
                          handleChange={e => handleChange(e, form)}
                          form={form}
                        />
                      </Box>
                    )
                  } else {
                    const test = data.find(
                      data => data.refValueId === form.valueId
                    )
                    if (test && test.content) value = test.content

                    return (
                      <Box key={i} sx={{ m: inputMargin, display: 'inline' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={
                                data.find(
                                  data => data.refValueId === form.valueId
                                )?.content === value
                              }
                              onChange={e =>
                                handleChange(
                                  e,
                                  dataForm.find(
                                    f => f.valueId === form.valueId
                                  ) || null
                                )
                              }
                            />
                          }
                          label={form.name}
                          sx={{ width: form.valueId === 520 ? 180 : 200 }}
                        />
                      </Box>
                    )
                  }
                })}
            </fieldset>
          )}
          {showSolid && (
            <fieldset
              style={{
                width: 425,
                border: '1px solid #CCC',
                borderRadius: '4px',
                paddingLeft: '8px',
                marginLeft: 7,
                marginBottom: 10,
              }}
            >
              <legend
                style={{
                  paddingLeft: 5,
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Solid Content
              </legend>
              {dataForm.length > 0 &&
                dataForm
                  .filter(f => [521, 522].includes(f.valueId))
                  .map((form, i) => {
                    let value = ''

                    const test = data.find(
                      data => data.refValueId === form.valueId
                    )
                    if (test && test.content) value = test.content

                    return (
                      <Box
                        key={i}
                        sx={{
                          m: inputMargin,
                          mt: -1,
                          mb: 0,
                          display: 'inline',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={
                                data.find(
                                  data => data.refValueId === form.valueId
                                )?.content === value
                              }
                              onChange={e =>
                                handleChange(
                                  e,
                                  dataForm.find(
                                    f => f.valueId === form.valueId
                                  ) || null
                                )
                              }
                            />
                          }
                          label={form.name}
                          sx={{ width: 160 }}
                        />
                      </Box>
                    )
                  })}
            </fieldset>
          )}
          {dataForm.length > 0 &&
            dataForm.slice(9).map((form, i) => {
              let value = ''
              if (form.type === 'S') {
                form.options.forEach(op => {
                  const test = data.find(data => data.contentOption === op.opId)
                  if (test) value = test.contentOption
                })

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <SelectField
                      minWidth={420}
                      value={value}
                      handleChange={e => handleChange(e, form)}
                      form={form}
                    />
                  </Box>
                )
              } else if (form.type === 'A') {
                const test = data.find(data => data.refValueId === form.valueId)
                if (test && test.content) value = test.content

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <CommentField
                      minWidth={420}
                      form={form}
                      value={value}
                      handleChange={e => handleChange(e, form)}
                    />
                  </Box>
                )
              }
            })}
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

export default AbnormalMass
