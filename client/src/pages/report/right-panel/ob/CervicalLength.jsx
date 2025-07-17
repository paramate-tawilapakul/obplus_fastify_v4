import { useEffect, useState, useContext } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
// import Button from '@mui/material/Button'
// import CheckIcon from '@mui/icons-material/Check'

import { API, TEMPLATES, REPORT_ID } from '../../../../config'
import {
  //   btStyle,
  inputMargin,
} from '../../../../components/page-tools/form-style'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import {
  autoSave3,
  //   cleanUpForm,
  getReportId,
  getRiD,
  randomMs,
  updateCvlDataChange,
} from '../../helper'
import { sleep } from '../../../../utils'
import SelectField from '../../../../components/page-tools/SelectField'
import InputTextField from '../../../../components/page-tools/InputTextField'
import { storeBackupData4, initFormSend } from '../../report-utils'
import DataContext from '../../../../context/data/dataContext'

const templateId = TEMPLATES.cervical.id
let backupData = null

const Cervical = ({ patient }) => {
  const { shortestCvl } = useContext(DataContext)
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [_, setDataFormSend] = useState([])
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
    updateCvlDataChange('0')

    return () => {
      autoSave3(backupData)
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
    storeBackupData4(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d) {
    updateCvlDataChange('1')

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
      storeBackupData4(temp)
      return temp
    })
  }

  //   async function saveData() {
  //     let newForm = cleanUpForm(dataFormSend)
  //     console.log(newForm)
  //     /// SAVE TO STORAGE FOR AUTO SAVE BEFORE PREVIEW
  //     storeBackupData4(dataFormSend)
  //     console.log(shortestCvl)

  //     if (shortestCvl && shortestCvl !== 'null') {
  //       newForm['633'] = shortestCvl
  //     } else {
  //       delete newForm['633']
  //     }

  //     const res = await axios.post(API.REPORT_CONTENT, {
  //       reportData: newForm,
  //     })

  //     if (res.data.data) {
  //       updateCvlDataChange('0')
  //     }
  //   }

  return (
    <>
      {/* {loading && <LinearProgress sx={{ mt: 0.5 }} />} */}
      {/* <SkeletonLoading loading={loading} style={{ mt: 0.5 }} /> */}

      <Fade in={!loading ? true : false} timeout={200}>
        <fieldset
          style={{
            borderRadius: 8,
            width: 395,
            marginLeft: 7,
            marginBottom: 3,
          }}
        >
          <legend>Cervical Length</legend>
          <div style={{ marginBottom: 10 }}>
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
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          //   alignContent: 'center',
                          //   justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ marginLeft: 10 }}>
                          Shortest Measurement &nbsp;&nbsp;&nbsp;
                          {shortestCvl}
                        </div>

                        <Box
                          sx={{
                            // width: 63,
                            ml: 1,
                            // mb: 1,
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
              {/* <Button
            sx={{ ...btStyle, m: inputMargin, display: loading && 'none' }}
            variant='contained'
            startIcon={<CheckIcon />}
            onClick={() => saveData()}
          >
            Save
          </Button> */}
            </div>
          </div>
        </fieldset>
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

export default Cervical
