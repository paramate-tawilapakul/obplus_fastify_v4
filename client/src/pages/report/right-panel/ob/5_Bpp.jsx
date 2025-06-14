import { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TextField from '@mui/material/TextField'

import { API, STORAGE_NAME, TEMPLATES, REPORT_ID } from '../../../../config'
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
import { sleep } from '../../../../utils'
import SelectField from '../../../../components/page-tools/SelectField'
import InputTextField from '../../../../components/page-tools/InputTextField'
import { storeBackupData, initFormSend } from '../../report-utils'

const templateId = TEMPLATES.bpp.id
let backupData = null

const defaultScore = {
  141: 0,
  142: 0,
  143: 0,
  144: 0,
  145: 0,
}

const twoScore = [222, 225, 228, 231, 234]
const scoreKeys = ['141', '142', '143', '144', '145']

const BPP = ({ patient }) => {
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(defaultScore)
  const [maxScore, setMaxScore] = useState(null)
  const currentTimeRef = useRef(null)

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
      if (!REPORT_ID[TEMPLATES.bpp.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.bpp.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  function handleSetScore(data) {
    const onlyScore = data.filter(
      d => d.refValueId >= 141 && d.refValueId <= 145
    )

    setMaxScore(onlyScore.length === 5 ? 10 : 8)

    setScore(prev => {
      let newScore = { ...prev }
      onlyScore.forEach(d => {
        newScore = {
          ...newScore,
          [d.refValueId]: twoScore.includes(d.contentOption) ? 2 : 0,
        }
      })

      return newScore
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.bpp.name, patient.currentFetus),
        },
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem(
            STORAGE_NAME.token
          )}`,
        },
      })

      handleSetScore(res.data.data)
      setData(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.bpp.name, patient.currentFetus),
      templateId
    )

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d) {
    updateDataChange('1')

    // console.log(d.type, e.target.value)
    // console.log(data)
    let v = e.target.value
    let isAllEmpty = true

    if (d.valueId >= 141 && d.valueId <= 145) {
      setScore(prev => {
        let newScore = { ...prev }
        newScore = {
          ...newScore,
          [d.valueId]: twoScore.includes(v) ? 2 : 0,
        }
        return newScore
      })
    }

    setDataFormSend(prev => {
      let temp = {
        ...prev,
        [d.valueId]: {
          ...prev[d.valueId],
          value: v,
        },
        139: { ...prev['139'], value: 214 },
      }

      // 139 scoring system opId 214
      Object.keys(temp).forEach(key => {
        if (key !== '139' && temp[key].value) isAllEmpty = false
      })

      if (isAllEmpty) {
        temp = {
          ...temp,
          139: { ...temp['139'], value: '' },
        }
      }

      backupData = temp
      storeBackupData(temp)

      let checkScoreOptions = 0
      Object.keys(temp).forEach(key => {
        if (scoreKeys.includes(key) && temp[key].value) checkScoreOptions += 1
      })
      setMaxScore(checkScoreOptions === 5 ? 10 : 8)

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
      {/* {loading && <LinearProgress sx={{ mt: 0.5 }} />} */}

      <div
        style={{
          // height: '100%',
          // overflowY: 'auto',
          // minHeight: 480,
          // maxHeight: 670,
          display: loading && 'none',
        }}
      >
        <Fade in={!loading ? true : false} timeout={300}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: 550,
              marginTop: 3,
              marginLeft: 10,
            }}
          >
            {dataForm.length > 0 &&
              dataForm.map((form, i) => {
                if (form.valueId === 140) return
                if (form.type === 'S') {
                  let value = ''
                  form.options.forEach(op => {
                    const test = data.find(
                      data => data.contentOption === op.opId
                    )
                    if (test) value = test.contentOption
                  })
                  let firstOptionBlank = true

                  let newForm = { ...form }
                  if (form.valueId === 139) {
                    // Scoring system
                    newForm.options = [form.options[0]]
                    value = newForm.options[0].id
                    firstOptionBlank = false
                  }

                  if (form.valueId === 141) {
                    newForm.options = [
                      {
                        ...form.options[1],
                        opName: form.options[1].opName + ' / 30mins',
                      },
                      {
                        ...form.options[2],
                        opName: form.options[2].opName + ' / 30mins',
                      },
                    ]
                  }

                  if (form.valueId > 141) {
                    newForm.options = [form.options[0], form.options[2]]
                  }

                  return (
                    <Box key={i} sx={{ m: inputMargin, display: 'flex' }}>
                      <SelectField
                        minWidth={450}
                        maxWidth={450}
                        value={value}
                        handleChange={e => handleChange(e, form)}
                        form={newForm}
                        firstOptionBlank={firstOptionBlank}
                      />
                      {form.valueId > 140 && (
                        <TextField
                          sx={{
                            ...inputStyle,
                            height: 40,
                            width: 40,
                            ml: 1,
                            pl: 0.2,
                          }}
                          size='small'
                          value={score[form.valueId]}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                    </Box>
                  )
                } else {
                  let value = ''

                  const test = data.find(
                    data => data.refValueId === form.valueId
                  )
                  if (test && test.content) value = test.content

                  if (form.name === 'Duration')
                    return (
                      <Box key={i} sx={{ m: inputMargin }}>
                        <InputTextField
                          width={300}
                          form={form}
                          value='30 minutes'
                          handleChange={e => handleChange(e, form)}
                          readOnly={true}
                        />
                      </Box>
                    )
                  // console.log(value)
                  return (
                    <Box key={i} sx={{ m: inputMargin }}>
                      <InputTextField
                        inputRef={currentTimeRef}
                        width={300}
                        form={form}
                        value={value}
                        handleChange={e => handleChange(e, form)}
                      />
                      <Button
                        sx={{ height: 40, ml: 1 }}
                        variant='contained'
                        color='info'
                        startIcon={<AccessTimeIcon />}
                        onClick={e => {
                          let currentTime = moment().format('HH:mm a')
                          e.target.value = currentTime
                          currentTimeRef.current.value = currentTime
                          handleChange(e, form)
                        }}
                      >
                        Current Time
                      </Button>
                    </Box>
                  )
                }
              })}

            {!loading && maxScore && (
              <div
                style={{
                  width: 500,
                  marginLeft: 10,
                  textAlign: 'right',
                }}
              >
                <strong>TOTAL SCORE</strong> &nbsp;&nbsp; &nbsp;&nbsp;
                {Object.keys(score)
                  .map(key => (scoreKeys.includes(key) ? key : undefined))
                  .reduce(
                    (accumulator, currentValue) =>
                      accumulator + parseInt(score[currentValue]),
                    0
                  )}
                /{maxScore}
                &nbsp;&nbsp;
              </div>
            )}

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
      </div>

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default BPP
