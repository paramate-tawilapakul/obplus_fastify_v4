import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import InfoIcon from '@mui/icons-material/Info'
import { blue, red } from '@mui/material/colors'

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
import InputTextField from '../../../../components/page-tools/InputTextField'
import { storeBackupData, initFormSend } from '../../report-utils'
import Details from './early-abnormal/Details'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const templateId = TEMPLATES.earlyPregnancy.id
let backupData = null

const infoColor = (abnId, value) => (abnId === value ? red[300] : blue[200])
const defaultShowInfo = { show: false, color: '', opId: 0 }

const EarlyPregnancy = ({ patient }) => {
  // console.log('render EarlyPregnancy')
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState({})
  const [showInfo, setShowInfo] = useState(defaultShowInfo)

  //for select filter
  const [placenta, setPlacenta] = useState(null)

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
    setPlacenta(null)
    setDataFormSend([])
    setShowInfo(defaultShowInfo)
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.earlyPregnancy.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.earlyPregnancy.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.earlyPregnancy.name, patient.currentFetus),
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
      getRiD(TEMPLATES.earlyPregnancy.name, patient.currentFetus),
      templateId
    )

    let hasPlacentaLocation = false
    let placentaId
    data.forEach(d => {
      if (d.contentValueName === 'Placenta Location') {
        hasPlacentaLocation = true
        placentaId = d.contentOption
      }
    })

    if (hasPlacentaLocation) {
      const objPlacenta = form
        .find(f => f.name === 'Placenta Location')
        .options.find(op => op.id === placentaId)
      setPlacenta(objPlacenta)
    }

    let abnId = ''
    let color = ''
    // console.log(data)
    data.forEach(d => {
      if (d.contentValueName === 'Cord') {
        let id = form
          .find(f => f.valueId === d.refValueId)
          .options.filter(o => o.name !== '3 vessels')
          .map(o => o.opId)
        abnId = form
          .find(f => f.valueId === d.refValueId)
          .options.find(o => o.name === 'Abnormal').opId

        if (id.includes(d.contentOption)) {
          color = infoColor(abnId, d.contentOption)
          setShowInfo(prev => ({
            ...prev,
            show: true,
            color,
            opId: d.contentOption,
          }))
        }
      }
    })

    // console.log(formSend)
    // console.log(form)

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  async function handleAbnormalDialog(form, value, isDelete = false) {
    let abnormalOrDetailsOpId = form.options
      .filter(op => ['Abnormal', 'Details'].includes(op.name))
      .map(m => m.opId)

    let abnId = abnormalOrDetailsOpId[0]

    let notVisibleOpId = form.options
      .filter(op => op.name === 'Not Visible')
      .map(m => m.opId)

    try {
      const res = await axios.get(API.REPORT_ABNORMAL_CONTENT, {
        params: {
          accession: patient.accession,
          currentFetus: patient.currentFetus,
          templateId: TEMPLATES.cordAbnormal.id,
          isDelete,
        },
      })

      if (
        abnormalOrDetailsOpId.includes(value) ||
        value === notVisibleOpId[0]
      ) {
        let abnData = res.data.data.data
        let reportId = res.data.data.reportId

        const res2 = await axios.get(API.REPORT_FORM, {
          params: {
            templateId: TEMPLATES.cordAbnormal.id,
          },
        })

        let form = res2.data.data.map(form => {
          let test = abnData.find(abn => abn.refValueId === form.valueId)
          let content = test?.content || ''

          return { ...form, content }
        })

        let formSend = {}
        form.forEach(f => {
          const t = abnData?.find(d => d.refValueId == f.valueId)
          if (t) {
            let value =
              !t.contentOption || t.contentOption === 0
                ? t.content
                : t.contentOption

            formSend[f.valueId] = {
              type: f.type,
              value,
            }
          }
        })

        setDialog(prev => ({
          ...prev,
          open: true,
          formSend: { ...formSend, reportId },
          form,
          type:
            value === notVisibleOpId[0]
              ? 'Not Visible'
              : value === abnormalOrDetailsOpId[0]
              ? 'Abnormal'
              : 'Details',
        }))

        setShowInfo(prev => ({
          ...prev,
          show: true,
          color: infoColor(abnId, value),
          opId: value,
        }))
      }

      if (
        !abnormalOrDetailsOpId.includes(value) &&
        value !== notVisibleOpId[0]
      ) {
        setShowInfo(prev => ({ ...prev, show: false, color: '', opId: 0 }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  function handleChange(e, d, newValue = null, isSelectFilter = false) {
    updateDataChange('1')
    if (isSelectFilter) {
      // console.log(d.type, 'select filter change', newValue)
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
      setPlacenta(newValue)
    } else {
      let v =
        d.type === 'A' ? replaceNewLineWithBr(e.target.value) : e.target.value

      // if (d.type === 'S')
      //   setData(prev =>
      //     prev.map(n => {
      //       if (n.refValueId === d.valueId) return { ...n, contentOption: v }
      //       return n
      //     })
      //   )

      if (d.name === 'Cord') {
        handleAbnormalDialog(d, v, true)
      }

      setDataFormSend(prev => {
        const temp = {
          ...prev,
          [d.valueId]: {
            ...prev[d.valueId],
            value: v,
          },
        }
        // console.log(temp)
        backupData = temp
        storeBackupData(temp)
        return temp
      })
    }
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
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            width: 750,
            marginTop: 3,
            marginLeft: 10,
          }}
        >
          {data && dataForm?.length > 0 && (
            <>
              {dataForm?.map((form, i) => {
                if (form.name === 'Structure') return
                let value = ''
                if (form.type === 'S') {
                  form.options.forEach(op => {
                    const test = data.find(
                      data => data.contentOption === op.opId
                    )
                    if (test) value = test.contentOption

                    if (form.valueId === 81) form.name = 'Heart Action'
                  })

                  return (
                    <div key={i}>
                      <Box sx={{ m: inputMargin }}>
                        {form.name === 'Placenta Location' ? (
                          <AutoCompleteField
                            ctrlValue={placenta}
                            handleChange={(e, newValue) =>
                              handleChange(e, form, newValue, true)
                            }
                            form={form}
                          />
                        ) : (
                          <>
                            {form.name === 'Cord' && showInfo.show && (
                              <InfoIcon
                                onClick={() =>
                                  handleAbnormalDialog(form, showInfo.opId)
                                }
                                sx={{
                                  cursor: 'pointer',
                                  mt: 1,
                                  mr: 0.5,
                                  color: showInfo.color,
                                }}
                              />
                            )}
                            <SelectField
                              value={value}
                              handleChange={e => handleChange(e, form)}
                              form={form}
                              minWidth={
                                form.name === 'Cord' && showInfo.show
                                  ? 303
                                  : undefined
                              }
                            />
                          </>
                        )}
                      </Box>
                    </div>
                  )
                } else {
                  const test = data.find(
                    data => data.refValueId === form.valueId
                  )
                  if (test && test.content) value = test.content

                  return (
                    <div key={i}>
                      {form.type === 'A' ? (
                        <Box sx={{ m: inputMargin }}>
                          <CommentField
                            minWidth={673}
                            form={form}
                            value={value}
                            handleChange={e => handleChange(e, form)}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ m: inputMargin }}>
                          <InputTextField
                            form={form}
                            value={value}
                            handleChange={e => handleChange(e, form)}
                          />
                        </Box>
                      )}
                    </div>
                  )
                }
              })}
            </>
          )}

          <Button
            sx={{ ...btStyle, m: 1.3, display: loading && 'none' }}
            variant='contained'
            startIcon={<CheckIcon />}
            onClick={() => saveData()}
          >
            Save
          </Button>
        </div>
      </Fade>

      <Details
        dialog={dialog}
        setOpen={setDialog}
        setSnackWarning={setSnackWarning}
      />
      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default EarlyPregnancy
