import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman'
import Typography from '@mui/material/Typography'

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
import AutoCompleteField from '../../../../components/page-tools/AutoCompleteField'
import { initFormSend, storeBackupData } from '../../report-utils'
import InputTextField from '../../../../components/page-tools/InputTextField'
import MultipleAutoCompleteField from '../../../../components/page-tools/MultipleAutoCompleteField'

const templateId = TEMPLATES.obDiagnosis.id
let backupData = null

const Diagnosis = ({ patient }) => {
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)

  //for select filter
  const [diagnosisList, setDiagnosisList] = useState([])
  const [diagnosisSelected, setDiagnosisSelected] = useState([])
  const [fetusRecommendation, setFetusRecommendation] = useState(null)
  const [motherRecommendation, setMotherRecommendation] = useState(null)

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
    setFetusRecommendation(null)
    setMotherRecommendation(null)
    setDiagnosisList([])
    setDiagnosisSelected([])
    setDataFormSend([])
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.obDiagnosis.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.obDiagnosis.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.obDiagnosis.name, patient.currentFetus),
        },
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem(
            STORAGE_NAME.token
          )}`,
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
      getRiD(TEMPLATES.obDiagnosis.name, patient.currentFetus),
      templateId
    )

    setDiagnosisList(
      form
        .filter(f => f.valueId === 69)[0]
        .options.map(d => ({ id: d.opId, name: d.display }))
    )

    let checkDiagnosisValue = data.filter(d => d.refValueId === 69)
    if (checkDiagnosisValue.length > 0) {
      const opIdArr = checkDiagnosisValue.map(c => c.contentOption)
      setDiagnosisSelected(
        form
          .find(f => f.valueId === 69)
          .options.filter(o => opIdArr.includes(o.opId))
          .map(c => ({ id: c.opId, name: c.display }))
      )
    }

    let hasFetusRecommendation = false
    let fetusRecommendationId
    data.forEach(d => {
      if (d.refValueId === 70) {
        //Fetus Recommendation/Treatment
        hasFetusRecommendation = true
        fetusRecommendationId = d.contentOption
      }
    })

    if (hasFetusRecommendation) {
      const objFetusRecommendation = form
        .find(f => f.valueId === 70)
        .options.find(op => op.id === fetusRecommendationId)

      setFetusRecommendation(objFetusRecommendation)
    }

    let hasMotherRecommendation = false
    let motherRecommendationId
    data.forEach(d => {
      if (d.refValueId === 73) {
        //Mother Recommendation/Treatment
        hasMotherRecommendation = true
        motherRecommendationId = d.contentOption
      }
    })

    if (hasMotherRecommendation) {
      const objMotherRecommendation = form
        .find(f => f.valueId === 73)
        .options.find(op => op.id === motherRecommendationId)

      setMotherRecommendation(objMotherRecommendation)
    }

    // let formSend = {}
    // form.forEach(f => {
    //   formSend[f.valueId] = {
    //     type: f.type,
    //     value: '',
    //   }
    // })
    // Object.keys(formSend).forEach(key => {
    //   const t = data.find(d => d.refValueId == key)
    //   if (t) {
    //     formSend[key].value =
    //       !t.contentOption || t.contentOption === 0
    //         ? t.content
    //         : t.contentOption
    //   }
    // })
    // formSend['reportId'] = getRiD(TEMPLATES.obDiagnosis.name, patient.currentFetus)

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d, newValue = null, isSelectFilter = false) {
    updateDataChange('1')
    if (isSelectFilter) {
      if (d.valueId !== 69) {
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

      if (d.valueId === 70) setFetusRecommendation(newValue)
      else if (d.valueId === 73) setMotherRecommendation(newValue)
      else if (d.valueId === 69) {
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
              width: 700,
              marginTop: 3,
              marginLeft: 10,
            }}
          >
            <Typography
              variant='h5'
              sx={{
                width: 500,
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <ChildCareIcon fontSize='large' />
              &nbsp; <div>Fetus</div>
            </Typography>

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
                    <Box key={i} sx={{ m: inputMargin, ml: 3 }}>
                      {form.valueId === 70 ? ( //fetus
                        <AutoCompleteField
                          ctrlValue={fetusRecommendation}
                          handleChange={(e, newValue) => {
                            handleChange(e, form, newValue, true)
                          }}
                          form={form}
                          width={670}
                        />
                      ) : form.valueId === 73 ? ( //mother
                        <AutoCompleteField
                          ctrlValue={motherRecommendation}
                          handleChange={(e, newValue) => {
                            handleChange(e, form, newValue, true)
                          }}
                          form={form}
                          width={670}
                        />
                      ) : form.valueId === 69 ? ( //multiple diagnosis
                        <MultipleAutoCompleteField
                          selected={diagnosisSelected}
                          options={diagnosisList}
                          handleChange={handleChange}
                          setSelected={setDiagnosisSelected}
                          form={form}
                          width={671}
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
                    <div key={i}>
                      <Box sx={{ m: inputMargin, ml: 3 }}>
                        <CommentField
                          minWidth={670}
                          form={form}
                          value={value}
                          row={2}
                          handleChange={e => handleChange(e, form)}
                          placeholder={
                            ['Diagnosis(Fetus)', 'Diagnosis(Mother)'].includes(
                              form.name
                            )
                              ? 'Choose Diagnosis from select list or fill in here...'
                              : undefined
                          }
                        />
                      </Box>
                      {form.valueId === 71 && (
                        <Typography
                          variant='h5'
                          sx={{
                            width: 670,
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            ml: -1,
                          }}
                        >
                          <PregnantWomanIcon fontSize='large' />
                          &nbsp;
                          <div>Mother</div>
                        </Typography>
                      )}
                    </div>
                  )
                } else {
                  {
                    let value = ''

                    const test = data.find(
                      data => data.refValueId === form.valueId
                    )
                    if (test && test.content) value = test.content

                    return (
                      <Box key={i} sx={{ m: inputMargin, ml: 3 }}>
                        <InputTextField
                          width={670}
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
              sx={{ ...btStyle, m: inputMargin, ml: 3 }}
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
