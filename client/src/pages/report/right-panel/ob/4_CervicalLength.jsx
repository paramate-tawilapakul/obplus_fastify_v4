import { useEffect, useState, useContext } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
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
  updateDataChange,
} from '../../helper'
import { sleep } from '../../../../utils'
import SelectField from '../../../../components/page-tools/SelectField'
import InputTextField from '../../../../components/page-tools/InputTextField'
import { storeBackupData, initFormSend } from '../../report-utils'
import DataContext from '../../../../context/data/dataContext'

const templateId = TEMPLATES.cervical.id
let backupData = null

const Cervical = ({ patient }) => {
  const { shortestCvl } = useContext(DataContext)
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
      if (!REPORT_ID[TEMPLATES.cervical.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.cervical.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.cervical.name, patient.currentFetus),
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
    let [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.cervical.name, patient.currentFetus),
      templateId
    )

    let shortestCvlValueId = form.find(
      d => d.display === 'Shortest Measurement'
    ).valueId

    formSend = {
      ...formSend,
      [shortestCvlValueId]: { type: 'T', value: shortestCvl + '' },
    }

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d) {
    updateDataChange('1')

    // console.log(d.type, e.target.value)
    let v = e.target.value

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
    let newForm = cleanUpForm(dataFormSend)
    console.log(newForm)
    /// SAVE TO STORAGE FOR AUTO SAVE BEFORE PREVIEW
    storeBackupData(dataFormSend)
    console.log(shortestCvl)

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
              width: 350,
              marginTop: 3,
              marginLeft: 10,
            }}
          >
            {dataForm.length > 0 &&
              dataForm.map((form, i) => {
                if (form.name === 'TVS Cervical Length') {
                  return (
                    <div key={i} style={{ display: 'flex' }}>
                      <div style={{ marginLeft: 10, marginBottom: 10 }}>
                        Shortest Measurement &nbsp;&nbsp;&nbsp; {shortestCvl}
                      </div>
                      <Box
                        sx={{
                          // width: 63,
                          ml: 0.5,
                          mb: 1,
                          // border: '1px solid white',
                          color: theme =>
                            theme.palette.mode === 'dark'
                              ? 'lightblue'
                              : 'blue',
                        }}
                      >
                        {form.unit}
                      </Box>
                    </div>
                  )
                }
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
                      <SelectField
                        value={value}
                        handleChange={e => handleChange(e, form)}
                        form={form}
                      />
                    </Box>
                  )
                } else {
                  let value = ''

                  const test = data.find(
                    data => data.refValueId === form.valueId
                  )
                  if (test && test.content) value = test.content

                  return (
                    <Box key={i} sx={{ m: inputMargin }}>
                      <InputTextField
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

export default Cervical
