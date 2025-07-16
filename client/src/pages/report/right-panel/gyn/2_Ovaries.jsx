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
import { Typography } from '@mui/material'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const templateId = TEMPLATES.ovaries.id
let backupData = null

const defaultShowAbnormal = { right: false, left: false }

const Ovaries = ({ patient }) => {
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAbnormal, setShowAbnormal] = useState(defaultShowAbnormal)

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
      if (!REPORT_ID[TEMPLATES.ovaries.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.ovaries.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.ovaries.name, patient.currentFetus),
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
      getRiD(TEMPLATES.ovaries.name, patient.currentFetus),
      templateId
    )

    let abObj = { ...defaultShowAbnormal }

    let hasRightAbnormal = data.find(d => d.contentOption === 489) || ''
    if (hasRightAbnormal) abObj = { ...abObj, right: true }
    let hasLeftAbnormal = data.find(d => d.contentOption === 476) || ''
    if (hasLeftAbnormal) abObj = { ...abObj, left: true }
    setShowAbnormal(abObj)

    // console.log(formSend)
    // console.log(form)

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d) {
    updateDataChange('1')

    let v = ['A', 'T'].includes(d.type)
      ? replaceNewLineWithBr(e.target.value)
      : e.target.value

    setDataFormSend(prev => {
      const temp = {
        ...prev,
        [d.valueId]: {
          ...prev[d.valueId],
          value: v,
        },
      }

      if (d.valueId === 509) {
        if (v === 489) {
          setShowAbnormal(prev => ({ ...prev, right: true }))
          temp['511'].value = ''
        } else {
          setShowAbnormal(prev => ({ ...prev, right: false }))
          temp['510'].value = ''
          setData(prev => prev.filter(p => p.refValueId !== 510))
        }
      }

      if (d.valueId === 505) {
        if (v === 476) {
          setShowAbnormal(prev => ({ ...prev, left: true }))
          temp['507'].value = ''
        } else {
          setShowAbnormal(prev => ({ ...prev, left: false }))
          temp['506'].value = ''
          setData(prev => prev.filter(p => p.refValueId !== 506))
        }
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
        <div>
          {dataForm.length > 0 && (
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ width: 350 }}>
                <Typography variant='h5' sx={{ ml: 1, mt: 1 }}>
                  Right Ovary
                </Typography>
                {dataForm.slice(4).map((form, i) => {
                  let value = ''
                  if (form.type === 'S') {
                    form.options.forEach(op => {
                      const test = data.find(
                        data => data.contentOption === op.opId
                      )
                      if (test) value = test.contentOption
                    })

                    return (
                      <div key={i}>
                        <Box sx={{ m: inputMargin, mt: 2 }}>
                          <SelectField
                            // maxWidth={350}
                            minWidth={350}
                            value={value}
                            handleChange={e => handleChange(e, form)}
                            form={{
                              ...form,
                              name: form.name.replace(' (Right)', ''),
                            }}
                          />
                        </Box>
                      </div>
                    )
                  } else {
                    const test = data.find(
                      data => data.refValueId === form.valueId
                    )
                    if (test && test.content) value = test.content

                    if (form.valueId === 511) form.name = 'Comments Right ovary'
                    else form.name = 'Right Morphology Abnormal'

                    return (
                      <div key={i}>
                        <Box sx={{ m: inputMargin, mt: 2 }}>
                          {showAbnormal['right'] && form.valueId === 510 && (
                            <CommentField
                              minWidth={350}
                              form={form}
                              value={value}
                              handleChange={e => handleChange(e, form)}
                              isRedStyle={true}
                              row={5}
                            />
                          )}

                          {!showAbnormal['right'] && form.valueId === 511 && (
                            <CommentField
                              minWidth={350}
                              form={form}
                              value={value}
                              handleChange={e => handleChange(e, form)}
                              row={5}
                            />
                          )}
                        </Box>
                      </div>
                    )
                  }
                })}
              </div>
              <div style={{ width: 350 }}>
                <Typography variant='h5' sx={{ ml: 1, mt: 1 }}>
                  Left Ovary
                </Typography>
                {dataForm.slice(0, 4).map((form, i) => {
                  let value = ''
                  if (form.type === 'S') {
                    form.options.forEach(op => {
                      const test = data.find(
                        data => data.contentOption === op.opId
                      )
                      if (test) value = test.contentOption
                    })

                    return (
                      <div key={i}>
                        <Box sx={{ m: inputMargin, mt: 2 }}>
                          <SelectField
                            minWidth={350}
                            value={value}
                            handleChange={e => handleChange(e, form)}
                            form={{
                              ...form,
                              name: form.name.replace(' (Left)', ''),
                            }}
                          />
                        </Box>
                      </div>
                    )
                  } else {
                    const test = data.find(
                      data => data.refValueId === form.valueId
                    )
                    if (test && test.content) value = test.content

                    if (form.valueId === 507) form.name = 'Comments left ovary'
                    else form.name = 'Left Morphology Abnormal'

                    return (
                      <div key={i}>
                        <Box sx={{ m: inputMargin, mt: 2 }}>
                          {showAbnormal['left'] && form.valueId === 506 && (
                            <CommentField
                              minWidth={350}
                              form={form}
                              value={value}
                              handleChange={e => handleChange(e, form)}
                              isRedStyle={true}
                              row={5}
                            />
                          )}

                          {!showAbnormal['left'] && form.valueId === 507 && (
                            <CommentField
                              minWidth={350}
                              form={form}
                              value={value}
                              handleChange={e => handleChange(e, form)}
                              row={5}
                            />
                          )}
                        </Box>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          )}

          <Button
            sx={{ ...btStyle, m: 1.3 }}
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

export default Ovaries
