import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import InfoIcon from '@mui/icons-material/Info'
import { blue, red } from '@mui/material/colors'

import { API, TEMPLATES, REPORT_ID } from '../../../../config'
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
// import AutoCompleteField from '../../../../components/page-tools/AutoCompleteField'
import { storeBackupData, initFormSend } from '../../report-utils'
import HeadShape from './anatomical-abnormal/1_HeadShape'
import GIT from './anatomical-abnormal/2_GI_Tract'
import Brain from './anatomical-abnormal/3_Brain'
import Kidneys from './anatomical-abnormal/4_Kidneys'
import Face from './anatomical-abnormal/5_Face'
import Spine from './anatomical-abnormal/6_Spine'
import NeckSkin from './anatomical-abnormal/7_NeckSkin'
import Skeleton from './anatomical-abnormal/8_Skeleton'
import Thorax from './anatomical-abnormal/9_Thorax'
import Extremities from './anatomical-abnormal/10_Extremities'
import Heart from './anatomical-abnormal/11_Heart'
import Cord from './anatomical-abnormal/12_Cord'
import Abdomen from './anatomical-abnormal/13_Abdomen'
import Genitalia from './anatomical-abnormal/14_Genitalia'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const templateId = TEMPLATES.anatomicalScan.id
let backupData = null

const infoColor = (abnId, value) => (abnId === value ? red[300] : blue[200])
const defaultShowInfo = {}

const AnatomicalScan = ({ patient }) => {
  // console.log('render AnatomicalScan')
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState({})
  const [showInfo, setShowInfo] = useState(defaultShowInfo)

  const templateMap = {
    'Head Shape': {
      id: TEMPLATES.headShapeAnatomicalAbnormal.id,
      component: valueId => (
        <HeadShape
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    'GI Tract': {
      id: TEMPLATES.gitAnatomicalAbnormal.id,
      component: valueId => (
        <GIT
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Brain: {
      id: TEMPLATES.brainAnatomicalAbnormal.id,
      component: valueId => (
        <Brain
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Kidneys: {
      id: TEMPLATES.kidneysAnatomicalAbnormal.id,
      component: valueId => (
        <Kidneys
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Face: {
      id: TEMPLATES.faceAnatomicalAbnormal.id,
      component: valueId => (
        <Face
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Spine: {
      id: TEMPLATES.spineAnatomicalAbnormal.id,
      component: valueId => (
        <Spine
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    'Neck/Skin': {
      id: TEMPLATES.neckSkinAnatomicalAbnormal.id,
      component: valueId => (
        <NeckSkin
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Skeleton: {
      id: TEMPLATES.skeletonAnatomicalAbnormal.id,
      component: valueId => (
        <Skeleton
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Thorax: {
      id: TEMPLATES.thoraxAnatomicalAbnormal.id,
      component: valueId => (
        <Thorax
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Extremities: {
      id: TEMPLATES.extremitiesAnatomicalAbnormal.id,
      component: valueId => (
        <Extremities
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Heart: {
      id: TEMPLATES.heartAnatomicalAbnormal.id,
      component: valueId => (
        <Heart
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Cord: {
      id: TEMPLATES.cordAnatomicalAbnormal.id,
      component: valueId => (
        <Cord
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Abdomen: {
      id: TEMPLATES.abdomenAnatomicalAbnormal.id,
      component: valueId => (
        <Abdomen
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
    Genitalia: {
      id: TEMPLATES.genitaliaAnatomicalAbnormal.id,
      component: valueId => (
        <Genitalia
          dialog={dialog[valueId]}
          setOpen={setDialog}
          setSnackWarning={setSnackWarning}
        />
      ),
    },
  }

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
    setShowInfo(defaultShowInfo)
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.anatomicalScan.name][patient.currentFetus]) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.anatomicalScan.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.anatomicalScan.name, patient.currentFetus),
        },
      })

      setData(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }
  // console.log(showInfo)
  function handleInfoIcon(form, d, abnName) {
    if (abnName.includes(d.contentValueName)) {
      // console.log(d.contentValueName)
      let abnId = ''
      let color = ''
      let id = form
        .find(f => f.valueId === d.refValueId)
        .options.filter(o => o.name !== 'Normal' && o.name !== '3 vessels')
        .map(o => o.opId)

      abnId = form
        .find(f => f.valueId === d.refValueId)
        .options.find(o => o.name === 'Abnormal').opId

      if (id.includes(d.contentOption)) {
        color = infoColor(abnId, d.contentOption)
        setShowInfo(prev => ({
          ...prev,
          [d.refValueId]: { show: true, color, opId: d.contentOption },
        }))
      }
    }
  }

  async function getReportForm(data) {
    let [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.anatomicalScan.name, patient.currentFetus),
      templateId
    )

    form = form.filter(
      f => ![190, 191, 192, 193, 196, 197, 209].includes(f.valueId)
    )

    const abnName = form
      .filter(f => f.type === 'S' && f.name !== 'Fetal Movements')
      .map(f => f.name)

    // console.log(form)

    data.forEach(d => handleInfoIcon(form, d, abnName))

    // console.log(formSend)
    // console.log(form)

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  async function handleAbnormalDialog(
    form,
    value,
    templateId,
    isDelete = false
  ) {
    // console.log(form)
    // console.log(value)
    // console.log(templateId)
    const valueId = form.valueId
    let abnormalOrDetailsOpId = form.options
      .filter(op => ['Abnormal', 'Details'].includes(op.name))
      .map(m => m.opId)

    // console.log(abnormalOrDetailsOpId)

    let abnId = abnormalOrDetailsOpId[0]
    // console.log(abnId)

    let notVisibleOpId = form.options
      .filter(op => op.name === 'Not Visible')
      .map(m => m.opId)

    // console.log(notVisibleOpId)

    try {
      const res = await axios.get(API.REPORT_ABNORMAL_CONTENT, {
        params: {
          accession: patient.accession,
          currentFetus: patient.currentFetus,
          templateId,
          isDelete,
        },
      })

      if (
        abnormalOrDetailsOpId.includes(value) ||
        value === notVisibleOpId[0]
      ) {
        let abnData = res.data.data.data
        let reportId = res.data.data.reportId
        // console.log(abnData)
        // console.log(reportId)

        const res2 = await axios.get(API.REPORT_FORM, {
          params: {
            templateId,
          },
        })

        let form = res2.data.data.map(form => {
          let test = abnData.find(abn => abn.refValueId === form.valueId)
          let content = test?.content || ''

          return { ...form, content }
        })

        if (
          templateId === TEMPLATES.neckSkinAnatomicalAbnormal.id &&
          value !== notVisibleOpId[0]
        ) {
          const res = await axios.get(API.REPORT_CONTENT, {
            params: {
              reportId: getRiD(
                TEMPLATES.obMeasurement.name,
                patient.currentFetus
              ),
            },
          })

          let findNF_NT = res.data.data.filter(d =>
            ['Nuchal Fold', 'NT'].includes(d.contentValueName)
          )

          if (findNF_NT.length > 0) {
            findNF_NT = findNF_NT.map(mes => ({
              name: mes.contentValueName,
              content: mes.content,
            }))

            form = [...form, ...findNF_NT]
          }
        }

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
          [valueId]: {
            currentFetus: patient.currentFetus,
            valueId,
            open: true,
            formSend: { ...formSend, reportId },
            form,
            type:
              value === notVisibleOpId[0]
                ? 'Not Visible'
                : value === abnormalOrDetailsOpId[0]
                ? 'Abnormal'
                : 'Details',
          },
        }))

        setShowInfo(prev => ({
          ...prev,
          [valueId]: {
            show: true,
            color: infoColor(abnId, value),
            opId: value,
          },
        }))
      }

      if (
        !abnormalOrDetailsOpId.includes(value) &&
        value !== notVisibleOpId[0]
      ) {
        setShowInfo(prev => ({
          ...prev,
          [form.valueId]: {
            show: false,
            color: '',
            opId: 0,
          },
        }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  function handleChange(e, d) {
    updateDataChange('1')

    let v =
      d.type === 'A' ? replaceNewLineWithBr(e.target.value) : e.target.value

    if (d.name !== 'Fetal Movements' && d.name !== 'Comments') {
      handleAbnormalDialog(d, v, templateMap[d.name].id, true)
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

  function handleAllNormal() {
    setDataFormSend(prev => {
      let normalSet = dataForm
        .map((d, index) => {
          if (index <= 13 && d.name !== 'Genitalia') {
            return {
              valueId: d.valueId,
              value:
                d.options.find(
                  o => o.display === 'Normal' || o.display === '3 vessels'
                )?.opId || 0,
            }
          }
        })
        .filter(d => d)

      normalSet = normalSet.reduce((acc, cur) => {
        acc[cur.valueId] = { ...prev[cur.valueId], value: cur.value }
        return acc
      }, {})

      const temp = {
        ...prev,
        ...normalSet,
      }
      // console.log(temp)
      backupData = temp
      storeBackupData(temp)
      saveAllNormalData(temp)
      return temp
    })
  }

  async function saveAllNormalData(data) {
    try {
      let newForm = cleanUpForm(data)
      storeBackupData(data)

      const res = await axios.post(API.REPORT_CONTENT, {
        reportData: newForm,
        isAllNormal: true,
        accession: patient.accession,
        currentFetus: patient.currentFetus,
      })

      if (res.data.data) {
        updateDataChange('0')
        resetData()
        initData()
      } else {
        // in case of error, auto save will execute
        updateDataChange('1')
      }
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
          <div style={{ width: 700, marginLeft: 7, marginBottom: 5 }}>
            <Button
              size='medium'
              variant='contained'
              color='info'
              onClick={handleAllNormal}
              sx={{ display: loading && 'none' }}
            >
              ALL NORMAL
            </Button>
          </div>
          {dataForm.length > 0 && (
            <>
              {dataForm.map((form, i) => {
                if (form.name === 'Structure') return
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
                      <Box sx={{ m: inputMargin }}>
                        {showInfo[form.valueId]?.show &&
                          showInfo[form.valueId]?.opId && (
                            <>
                              <InfoIcon
                                onClick={() =>
                                  handleAbnormalDialog(
                                    form,
                                    showInfo[form.valueId].opId,
                                    templateMap[form.name].id
                                  )
                                }
                                sx={{
                                  cursor: 'pointer',
                                  mt: 1,
                                  mr: 0.5,
                                  color: showInfo[form.valueId].color,
                                }}
                              />
                              {templateMap[form.name].component(form.valueId)}
                            </>
                          )}
                        <SelectField
                          value={value}
                          handleChange={e => handleChange(e, form)}
                          form={form}
                          minWidth={
                            showInfo[form.valueId]?.show ? 302 : undefined
                          }
                        />
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
                      <Box sx={{ m: inputMargin }}>
                        <CommentField
                          minWidth={673}
                          form={form}
                          value={value}
                          handleChange={e => handleChange(e, form)}
                        />
                      </Box>
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

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default AnatomicalScan
