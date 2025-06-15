import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'

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
import { initFormSend, storeBackupData } from '../../report-utils'
import InputTextField from '../../../../components/page-tools/InputTextField'
import MultipleAutoCompleteField from '../../../../components/page-tools/MultipleAutoCompleteField'

const templateId = TEMPLATES.gynDiagnosis.id
let backupData = null

const Diagnosis = ({ patient }) => {
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)

  //for select filter
  const [diagnosisList, setDiagnosisList] = useState([])
  const [diagnosisSelected, setDiagnosisSelected] = useState([])

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
    setDiagnosisList([])
    setDiagnosisSelected([])
    setDataFormSend([])
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.gynDiagnosis.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.gynDiagnosis.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.gynDiagnosis.name, patient.currentFetus),
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
      getRiD(TEMPLATES.gynDiagnosis.name, patient.currentFetus),
      templateId
    )

    setDiagnosisList(
      form
        .filter(f => f.valueId === 630)[0]
        .options.map(d => ({ id: d.opId, name: d.display }))
    )

    let checkDiagnosisValue = data.filter(d => d.refValueId === 630)
    if (checkDiagnosisValue.length > 0) {
      const opIdArr = checkDiagnosisValue.map(c => c.contentOption)
      setDiagnosisSelected(
        form
          .find(f => f.valueId === 630)
          .options.filter(o => opIdArr.includes(o.opId))
          .map(c => ({ id: c.opId, name: c.display }))
      )
    }

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d, newValue = null, isSelectFilter = false) {
    updateDataChange('1')
    if (isSelectFilter) {
      if (d.valueId !== 630) {
        setDataFormSend(prev => {
          const temp = {
            ...prev,
            [d.valueId]: {
              ...prev[d.valueId],
              value: newValue?.opId || '',
            },
          }
          backupData = temp
          storeBackupData(temp)

          return temp
        })
      }

      if (d.valueId === 630) {
        setDataFormSend(prev => {
          let value = newValue.map(n => ({ type: 'S', value: n.id }))

          const temp = {
            ...prev,
            [d.valueId]: value,
          }

          // console.log(temp)
          backupData = temp
          storeBackupData(temp)

          return temp
        })
      }
    } else {
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
        backupData = temp
        storeBackupData(temp)
        return temp
      })
    }
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
          display: loading && 'none',
        }}
      >
        <Fade in={!loading ? true : false} timeout={300}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              width: 700,
              marginTop: 3,
              // marginLeft: 10,
            }}
          >
            {dataForm.length > 0 &&
              dataForm.map((form, i) => {
                if (form.valueId === 1) return
                if (form.type === 'S') {
                  let value = ''
                  form.options.forEach(op => {
                    const test = data.find(
                      data => data.contentOption === op.opId
                    )
                    if (test) value = test.contentOption
                  })

                  return (
                    <Box key={i} sx={{ m: inputMargin }}>
                      {form.valueId === 630 ? ( //multiple diagnosis
                        <MultipleAutoCompleteField
                          selected={diagnosisSelected}
                          options={diagnosisList}
                          handleChange={handleChange}
                          setSelected={setDiagnosisSelected}
                          form={form}
                          width={670}
                        />
                      ) : (
                        <SelectField
                          minWidth={670}
                          maxWidth={670}
                          value={value}
                          handleChange={e => handleChange(e, form)}
                          form={form}
                        />
                      )}
                    </Box>
                  )
                } else if (form.type === 'A') {
                  let value = ''

                  const test = data.find(
                    data => data.refValueId === form.valueId
                  )
                  if (test && test.content) value = test.content

                  return (
                    <Box key={i} sx={{ m: inputMargin }}>
                      <CommentField
                        minWidth={670}
                        form={form}
                        value={value}
                        row={5}
                        handleChange={e => handleChange(e, form)}
                        placeholder={
                          form.name === 'Diagnosis'
                            ? 'Choose Diagnosis from select list or fill in here...'
                            : undefined
                        }
                      />
                    </Box>
                  )
                } else {
                  {
                    let value = ''

                    const test = data.find(
                      data => data.refValueId === form.valueId
                    )
                    if (test && test.content) value = test.content

                    return (
                      <Box key={i} sx={{ m: inputMargin }}>
                        <InputTextField
                          width={600}
                          form={{ ...form, name: '' }}
                          value={value}
                          handleChange={e => handleChange(e, form)}
                          // placeholder='Choose Diagnosis from select list or fill in here...'
                        />
                      </Box>
                    )
                  }
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

export default Diagnosis
