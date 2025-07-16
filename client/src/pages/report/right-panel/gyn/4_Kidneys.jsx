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
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const templateId = TEMPLATES.kidneys.id
let backupData = null

const Kidneys = ({ patient }) => {
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)

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
      if (!REPORT_ID[TEMPLATES.kidneys.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.kidneys.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.kidneys.name, patient.currentFetus),
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
      getRiD(TEMPLATES.kidneys.name, patient.currentFetus),
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
            width: 700,
            marginTop: 3,
            marginLeft: 10,
          }}
        >
          {dataForm.length > 0 &&
            dataForm.map((form, i) => {
              if (form.type === 'S') {
                let value = ''
                form.options.forEach(op => {
                  const test = data.find(data => data.contentOption === op.opId)
                  if (test) value = test.contentOption
                })

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <SelectField
                      value={value}
                      handleChange={e => handleChange(e, form)}
                      form={form}
                    />
                  </Box>
                )
              } else if (form.type === 'A') {
                let value = ''

                const test = data.find(data => data.refValueId === form.valueId)
                if (test && test.content) value = test.content

                return (
                  <Box key={i} sx={{ m: inputMargin }}>
                    <CommentField
                      minWidth={673}
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

export default Kidneys
