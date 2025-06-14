import { useEffect, useState, useRef } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { Divider } from '@mui/material'

import { API, STORAGE_NAME, TEMPLATES, REPORT_ID } from '../../../../config'
import {
  btStyle,
  inputMargin,
} from '../../../../components/page-tools/form-style'
import SnackBarWarning from '../../../../components/page-tools/SnackBarWarning'
import {
  autoSave,
  autoSave2,
  cleanUpForm,
  getReportId,
  getRiD,
  randomMs,
  replaceNewLineWithBr,
  updateDataChange,
  updateProcedureDataChange,
} from '../../helper'
import { sleep } from '../../../../utils'
import CommentField from '../../../../components/page-tools/CommentField'
import SelectField from '../../../../components/page-tools/SelectField'
import InputTextField from '../../../../components/page-tools/InputTextField'
import {
  storeBackupData,
  storeBackupData3,
  initFormSend,
} from '../../report-utils'
import Amniocentesis from './invasive-procedure/1_Amniocentesis'
import CVS from './invasive-procedure/2_CVS'
import Cordocentesis from './invasive-procedure/3_Cordocentesis'
import IntrauterineTransfusion from './invasive-procedure/4_IntrauterineTransfusion'

const templateId = TEMPLATES.invasivePrerequisite.id
let backupData = null
let backupProcedureData = null

const procedureMap = {
  Amniocentesis: TEMPLATES.invasiveAmniocentesis,
  CVS: TEMPLATES.invasiveCvs,
  Cordocentesis: TEMPLATES.invasiveCordocentesis,
  'Intrauterine Transfusion': TEMPLATES.invasiveIntrauterineTranfusion,
}

const optionsGA = [
  { opId: 'LMP', display: 'LMP' },
  { opId: 'EDC', display: 'EDC' },
  { opId: 'US', display: 'US' },
  { opId: 'Other', display: 'Other' },
]

const indsForInvasive = [
  'Advanced maternal age',
  'Abnormal results in maternal screening for fetal aneuploidy',
  'Maternal / paternal / family history of choromosomal abnormality or carrier of a balanced structural chromosomal rearrangement',
  'Previous child with a chromosome abnormality',
  'Ultrasound findings with possible fetal chromosomal abnormality:',
  'Severe fetal growth restriction',
  'Unexplained perinatal death, subfertility',
  'Risk for fetal gene or mitochondrial disorders',
  'Maternal request',
  'Other:',
]

const defaultBtn = {
  prerequisite: { show: true, active: true },
  procedure: { show: false, active: false, name: '' },
}

const sOptions = {
  indirectCoombsTest: false,
  antiDtiter: false,
  antiDimmunUnit: false,
}
let setIndsForInv = []
let setAmnioticFluidTest = []
let setPostProcedure = []
let setSamplingSite = []
let freetextValueId = []

const Invasive = ({ patient }) => {
  // const [data, setData] = useState(null)
  const [btnActive, setBtnActive] = useState(defaultBtn)
  const [dataForm, setDataForm] = useState([])
  const [data1Form, setData1Form] = useState([])
  const [dataFormSend, setDataFormSend] = useState(null)
  //eslint-disable-next-line
  const [procedureDataFormSend, setProcedureDataFormSend] = useState(null)
  const [loading, setLoading] = useState(false)
  // const [freetextValueId, setFreetextValueId] = useState([])
  const [procedure, setProcedure] = useState({
    Amniocentesis: null,
    CVS: null,
    Cordocentesis: null,
    'Intrauterine Transfusion': null,
  })

  useEffect(() => {
    // console.log('clear')
    setIndsForInv = []
    setAmnioticFluidTest = []
    setPostProcedure = []
    setSamplingSite = []

    return () => {}
  }, [])

  const [showOptions, setShowOption] = useState(sOptions)
  const [showOtherProcedure, setShowOtherProcedure] = useState(false)
  const [showContrainText, setShowContrainText] = useState(false)
  const [showUterusText, setShowUterusText] = useState(false)
  const [showInstrumentText, setShowInstrumentText] = useState(false)
  // const [indsForInv, setIndsForInv] = useState([])

  const prerequisiteRef = useRef(null)
  const procedureRef = useRef(null)
  const gaRef = useRef(null)
  const usRef = useRef(null)
  const otherRef = useRef(null)
  const amnioticRef = useRef(null)
  const complicationRef = useRef(null)

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: null,
  })

  const CheckBox = (form, width = '100%') => {
    let { cname, index } = form
    // console.log(dataForm)
    // console.log(form.content)
    // console.log('cname', cname)
    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center', width }}>
        <FormControlLabel
          control={
            <Checkbox
              name={cname}
              // defaultChecked={
              //   form.content.indexOf(cname.replace(', ', ',')) > -1
              // }
              defaultChecked={
                cname === indsForInvasive[4]
                  ? form.content.indexOf('chromosomal abnormality') > -1
                  : cname === indsForInvasive[6]
                  ? form.content.indexOf(
                      cname.replace('death, subfertility', 'death,subfertility')
                    ) > -1
                  : cname === indsForInvasive[9]
                  ? form.content.indexOf('Other') > -1
                  : form.content.indexOf(cname) > -1
              }
              sx={{
                p: 0.5,
              }}
              // inputProps={{ 'data-value': label, 'data-name': name }}
              onChange={e => handleChange(e, { ...form, cname })}
            />
          }
          label={cname}
          sx={{
            m: 0,
            // width,
          }}
        />
        {cname === indsForInvasive[4] && (
          <InputTextField
            inputRef={usRef}
            value={
              dataForm.find(item => item.name === 'ind freetext 1')?.content
            }
            form={{ ...form, name: '' }}
            width={180}
            sx={{ ml: 1 }}
            paddingLeft={5}
            handleChange={e => {
              // let valueId = dataForm.find(
              //   item => item.name === 'ind freetext 1'
              // ).valueId
              console.log(freetextValueId)
              updateDataChange('1')

              setDataFormSend(prev => {
                // let v = prev[form.valueId].value.replace(
                //   indsForInvasive[4],
                //   indsForInvasive[4] + ' ' + e.target.value
                // )

                let temp = {
                  ...prev,
                  [freetextValueId[0]]: {
                    ...prev[freetextValueId[0]],
                    value: e.target.value?.trim(),
                  },
                }

                temp = cleanData(temp)
                backupData = temp
                storeBackupData(temp)
                return temp
              })
            }}
          />
        )}

        {cname === indsForInvasive[9] && (
          <InputTextField
            inputRef={otherRef}
            value={
              dataForm.find(item => item.name === 'ind freetext 2')?.content
            }
            form={{ ...form, name: '' }}
            width={347}
            sx={{ ml: 1 }}
            paddingLeft={5}
            handleChange={e => {
              // let valueId = dataForm.find(
              //   item => item.name === 'ind freetext 2'
              // ).valueId

              updateDataChange('1')
              // console.log(dataFormSend)

              setDataFormSend(prev => {
                // let v = prev[form.valueId].value.replace(
                //   indsForInvasive[9],
                //   indsForInvasive[9] + ' ' + e.target.value
                // )

                let temp = {
                  ...prev,
                  [freetextValueId[1]]: {
                    ...prev[freetextValueId[1]],
                    value: e.target.value?.trim(),
                  },
                }

                temp = cleanData(temp)
                backupData = temp
                storeBackupData(temp)
                return temp
              })
            }}
          />
        )}
      </div>
    )
  }

  useEffect(() => {
    resetData()
    initData()
    updateDataChange('0')
    updateProcedureDataChange('0')

    return () => {
      autoSave(backupData)
      autoSave2(backupProcedureData)
      backupData = null
      backupProcedureData = null
    }

    // eslint-disable-next-line
  }, [patient])

  function resetData() {
    // setData(null)
    setDataForm([])
    setDataFormSend(null)
    setProcedureDataFormSend(null)
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (
        !REPORT_ID[TEMPLATES.invasivePrerequisite.name][patient.currentFetus]
      ) {
        // console.log('******getReportId()', rand)
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.invasivePrerequisite.name][patient.currentFetus] =
          id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(
            TEMPLATES.invasivePrerequisite.name,
            patient.currentFetus
          ),
        },
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem(
            STORAGE_NAME.token
          )}`,
        },
      })

      // setData(res.data.data)
      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.invasivePrerequisite.name, patient.currentFetus),
      templateId
    )
    // console.log('data', data)
    // console.log('form', form)

    let tempArr = form.map(f => {
      let t = data.find(d => d.refValueId === f.valueId)
      if (t) return { ...f, content: t.content, contentOption: t.contentOption }

      return { ...f, content: '' }
    })
    console.log(tempArr)
    freetextValueId = [
      tempArr.find(d => d.name === 'ind freetext 1')?.valueId,
      tempArr.find(d => d.name === 'ind freetext 2')?.valueId,
    ]
    // console.log(data)

    let rhTyping = data.find(
      d =>
        d.contentValueName === 'Rh typing' &&
        d.contentOptionDisplay === 'Negative*'
    )
    if (rhTyping) {
      setShowOption(prev => ({ ...prev, indirectCoombsTest: true }))
    }

    let indirectCoombsTest = data.find(
      d =>
        d.contentValueName === 'Indirect Coombs test' &&
        d.contentOptionDisplay === 'Positive*'
    )
    if (indirectCoombsTest) {
      setShowOption(prev => ({ ...prev, antiDtiter: true }))
    }

    let anntiD = data.find(
      d =>
        d.contentValueName === 'Anti-D immunoglobulin' &&
        d.contentOptionDisplay === 'Yes'
    )

    if (anntiD) {
      setShowOption(prev => ({ ...prev, antiDimmunUnit: true }))
    }

    let inds = tempArr.find(
      d => d.name === 'Indications for invasive procedure'
    )
    if (inds.content) {
      setIndsForInv = inds.content.split(', ')
      // console.log(setIndsForInv)
    }

    let otherProcedure = data.find(
      d =>
        d.contentValueName === 'Procedure' && d.contentOptionDisplay === 'Other'
    )
    if (otherProcedure) {
      setShowOtherProcedure(true)
    }

    let contraindications = data.find(
      d =>
        d.contentValueName === 'Contraindications' &&
        d.contentOptionDisplay === 'Other'
    )
    if (contraindications) {
      setShowContrainText(true)
    }

    // console.log('form', tempArr)

    let pname =
      form
        .find(d => d.name === 'Procedure')
        .options.find(option => option.opId === tempArr[10].contentOption)
        ?.display || ''

    // console.log(pname)

    if (pname && pname !== 'Other') {
      setBtnActive(prev => ({
        ...prev,
        procedure: { ...prev.procedure, name: pname, show: true },
      }))
    }

    // setTimeout(() => {
    await getProcedureForm(pname)
    // }, 500)

    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)
    // console.log(tempArr)
    setDataForm(tempArr)
    setLoading(false)
  }

  async function getProcedureForm(procedure) {
    if (!procedure || procedure === 'Other') return
    if (!REPORT_ID[procedureMap[procedure].name][patient.currentFetus]) {
      const id = await getReportId(
        patient.accession,
        patient.currentFetus,
        procedureMap[procedure].id
      )

      REPORT_ID[procedureMap[procedure].name][patient.currentFetus] = id
    }

    setShowUterusText(false)
    setShowInstrumentText(false)

    const res = await axios.get(API.REPORT_CONTENT, {
      params: {
        reportId: REPORT_ID[procedureMap[procedure].name][patient.currentFetus],
      },
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem(
          STORAGE_NAME.token
        )}`,
      },
    })

    let data = res.data.data

    const [formSend, form] = await initFormSend(
      data,
      REPORT_ID[procedureMap[procedure].name][patient.currentFetus],
      procedureMap[procedure].id
    )
    // console.log(formSend)
    // console.log(form)
    let tempArr = form.map(f => {
      let form = f
      let name = f.name

      if (name === 'Entries uterus') {
        form = {
          ...form,
          name: 'No. of uterine entry',
          display: 'No. of uterine entry',
        }
      }

      let t = data.find(d => d.refValueId === form.valueId)
      if (t)
        return { ...form, content: t.content, contentOption: t.contentOption }

      return { ...form, content: '' }
    })

    // console.log(tempArr)
    // console.log(form)
    // console.log(data)
    if (procedure === 'Amniocentesis') {
      setAmnioticFluidTest = tempArr[11].content.split(', ')
      setPostProcedure = tempArr[14].content.split(', ')

      let uterus = data.find(
        d =>
          d.contentValueName === 'Uterus' &&
          d.contentOptionDisplay === 'Abnormal'
      )
      if (uterus) {
        setShowUterusText(true)
      }

      let instrument = data.find(
        d =>
          d.contentValueName === 'Instrument' &&
          d.contentOptionDisplay === 'Other'
      )
      if (instrument) {
        setShowInstrumentText(true)
      }
    } else if (procedure === 'CVS') {
      setAmnioticFluidTest = tempArr[9].content.split(', ')
      setPostProcedure = tempArr[12].content.split(', ')
      let uterus = data.find(
        d =>
          d.contentValueName === 'Uterus' &&
          d.contentOptionDisplay === 'Abnormal'
      )
      if (uterus) {
        setShowUterusText(true)
      }

      let instrument = data.find(
        d =>
          d.contentValueName === 'Instrument' &&
          d.contentOptionDisplay === 'Other'
      )
      if (instrument) {
        setShowInstrumentText(true)
      }
    } else if (procedure === 'Cordocentesis') {
      setSamplingSite = tempArr[0].content.split(', ')
      setAmnioticFluidTest = tempArr[9].content.split(', ')
      setPostProcedure = tempArr[12].content.split(', ')

      let instrument = data.find(
        d =>
          d.contentValueName === 'Instrument' &&
          d.contentOptionDisplay === 'Other'
      )
      if (instrument) {
        setShowInstrumentText(true)
      }
    } else if (procedure === 'Intrauterine Transfusion') {
      setSamplingSite = tempArr[0].content.split(', ')
      setAmnioticFluidTest = tempArr[10].content.split(', ')
      setPostProcedure = tempArr[19].content.split(', ')

      let instrument = data.find(
        d =>
          d.contentValueName === 'Instrument' &&
          d.contentOptionDisplay === 'Other'
      )
      if (instrument) {
        setShowInstrumentText(true)
      }
    }

    // console.log(formSend)
    backupProcedureData = formSend
    setProcedureDataFormSend(formSend)
    storeBackupData3(formSend)
    // console.log(tempArr)
    setData1Form(tempArr)
    setProcedure(prev => ({ ...prev, [procedure]: tempArr }))
  }

  function handleChange(e, d) {
    // console.log(d, d.options, e.target.value)
    let v =
      d.type === 'A' ? replaceNewLineWithBr(e.target.value) : e.target.value

    if (d.templateId === 41) {
      updateDataChange('1')
      if (d.name === 'Procedure') {
        let pname =
          d.options.find(option => option.opId === e.target.value)?.display ||
          ''

        if (pname && pname !== 'Other') {
          setBtnActive(prev => ({
            prerequisite: { ...prev.prerequisite, active: false },
            procedure: {
              ...prev.procedure,
              name: pname,
              show: true,
              active: true,
            },
          }))

          procedureRef.current.style.display = 'block'
          prerequisiteRef.current.style.display = 'none'
        } else {
          setBtnActive(defaultBtn)
          prerequisiteRef.current.style.display = 'block'
          procedureRef.current.style.display = 'none'
        }
      }

      if (d.name === 'Corrected GA') {
        if (d.selectOption) {
          let value = e.target.value
          let t =
            value === optionsGA[0].opId
              ? patient.lmpGa
              : value === optionsGA[1].opId
              ? patient.edcGa
              : value === optionsGA[2].opId
              ? patient.usGa
              : optionsGA[3].opId

          gaRef.current.value = [optionsGA[3].opId, ''].includes(t) ? '' : t

          v = t === optionsGA[3].opId || !t ? '' : t
        }
      }

      if (d.name === 'Rh typing') {
        // console.log(d.options[1].opId)
        if (e.target.value === d.options[1].opId) {
          setShowOption(prev => ({ ...prev, indirectCoombsTest: true }))
        } else {
          setShowOption(sOptions)
        }
      }
      if (d.name === 'Indirect Coombs test') {
        if (e.target.value === d.options[1].opId) {
          setShowOption(prev => ({ ...prev, antiDtiter: true }))
        } else {
          setShowOption(prev => ({
            ...prev,
            antiDtiter: false,
            antiDimmunUnit: false,
          }))
        }
      }
      if (d.name === 'Anti-D immunoglobulin') {
        if (e.target.value === d.options[1].opId) {
          setShowOption(prev => ({ ...prev, antiDimmunUnit: true }))
        } else {
          setShowOption(prev => ({ ...prev, antiDimmunUnit: false }))
        }
      }

      if (d.name === 'Indications for invasive procedure') {
        let { name, checked } = e.target

        // console.log(setIndsForInv)

        let t = [...setIndsForInv]
        if (t[0] === '') t = []

        if (name === indsForInvasive[6]) name = name.replace(', ', ',')

        if (checked) t.push(name)
        else {
          // console.log(name)
          if (name === indsForInvasive[4]) {
            console.log(name)
            // let usref = usRef.current.value.trim()
            // if (usref !== '') {
            //   name = indsForInvasive[4] + ' ' + usRef.current.value.trim()
            //   usRef.current.value = ''
            // }
            usRef.current.value = ''
          } else if (name === indsForInvasive[9]) {
            // let otherref = otherRef.current.value.trim()
            // if (otherref !== '') {
            //   name = indsForInvasive[9] + ' ' + otherRef.current.value.trim()
            //   otherRef.current.value = ''
            // }
            otherRef.current.value = ''
          }

          t.splice(t.indexOf(name), 1)
        }
        // console.log(t)
        // t = t.map(t => {
        //   if (t.includes('chromosomal abnormality')) {
        //     return t.split(':')[0] + ':'
        //   } else return t
        // })

        // console.log(t)
        v = t.join(', ')
        // console.log(v)
        // setIndsForInv = t
        // v = ''
      }

      if (d.name === 'Contraindications') {
        if (e.target.value === d.options[1].opId) {
          setShowContrainText(true)
        } else {
          setShowContrainText(false)
        }
      }

      if (d.name === 'Procedure') {
        if (e.target.value === d.options[4].opId) {
          setShowOtherProcedure(true)
        } else {
          setShowOtherProcedure(false)
        }
      }
      setDataFormSend(prev => {
        console.log(freetextValueId)
        let temp = {
          ...prev,
          [d.valueId]: {
            ...prev[d.valueId],
            value: v,
          },
          // [freetextValueId[0]]: {
          //   ...prev[freetextValueId[0]],
          //   value: usRef.current.value.trim(),
          // },
          // [freetextValueId[1]]: {
          //   ...prev[freetextValueId[1]],
          //   value: otherRef.current.value.trim(),
          // },
        }

        temp = cleanData(temp)
        backupData = temp
        storeBackupData(temp)
        return temp
      })
    } else {
      updateProcedureDataChange('1')
      if (d.name === 'Uterus') {
        if (e.target.value === d.options[1].opId) {
          setShowUterusText(true)
        } else {
          setShowUterusText(false)
        }
      }
      if (d.name === 'Instrument') {
        if (e.target.value === d.options[d.options.length - 1].opId) {
          setShowInstrumentText(true)
        } else {
          setShowInstrumentText(false)
        }
      }

      if (d.name === 'Sampling Site') {
        let { name, checked } = e.target
        let t = [...setSamplingSite]
        if (t[0] === '') t = []

        if (checked) {
          t.push(name)
        } else {
          t.splice(t.indexOf(name), 1)
        }
        // console.log(t)
        v = t.join(', ')
        // console.log('v', v)
        setSamplingSite = t
        // if (d.valueId === 764) v = ''
      }

      if (
        [
          'Amniotic fluid test for',
          'CVS sampling tissue test for',
          'Cordocentesis test for',
          'Transfusion',
        ].includes(d.name)
      ) {
        let { name, checked } = e.target

        let t = [...setAmnioticFluidTest]
        if (t[0] === '') t = []

        let amnioticText = amnioticRef?.current?.value?.trim()

        if (name.indexOf('Other') > -1) {
          name = 'Other> ' + amnioticText
        }

        if (checked) {
          t.push(name)
        } else {
          if (name.indexOf('Other') > -1) {
            amnioticRef.current.value = ''
          }

          t.splice(t.indexOf(name), 1)
        }
        // console.log(t)
        v = t.join(', ')
        // console.log('v', v)
        setAmnioticFluidTest = t
        // if (d.valueId === 774) v = ''
      }

      if (d.name === 'Complication') {
        // console.log(v)

        if (!v || v === d.options[0].opId) {
          complicationRef.current.value = ''
        }
      }
      if (d.name === 'Post procedure instructions') {
        let { name, checked } = e.target

        let t = [...setPostProcedure]
        if (t[0] === '') t = []

        if (checked) {
          t.push(name)
        } else {
          t.splice(t.indexOf(name), 1)
        }
        // console.log(t)
        v = t.join(', ')
        // console.log('v', v)
        setPostProcedure = t
        // if (d.valueId === 783) v = ''
      }

      setProcedureDataFormSend(prev => {
        let temp = {
          ...prev,
          [d.valueId]: {
            ...prev[d.valueId],
            value: v,
          },
        }
        // console.log(d.templateId)
        if (d.templateId === 42) {
          temp = cleanData2(temp)
        } else if (d.templateId === 43) {
          temp = cleanData3(temp)
        } else if (d.templateId === 44) {
          temp = cleanData4(temp)
        } else if (d.templateId === 45) {
          temp = cleanData5(temp)
        }

        backupProcedureData = temp
        storeBackupData3(temp)
        // console.log(temp)
        return temp
      })
    }
  }

  function manageFreeText(valueRef, target, word) {
    let value = valueRef.trim()
    let t = target.split(', ')
    for (let i = 0; i < t.length; i++) {
      let check = t[i]
      if (check.indexOf(word) > -1) {
        t[i] = word + ' ' + value
      }
    }

    return t.join(', ')
  }

  function cleanData(data) {
    let tempD = { ...data }

    if (
      tempD[dataForm[8].valueId].value === '' ||
      tempD[dataForm[8].valueId].value === dataForm[8].options[0].opId
    ) {
      tempD[dataForm[9].valueId].value = ''
    }

    if (tempD[dataForm[5].valueId].value !== dataForm[5].options[1].opId) {
      tempD[dataForm[6].valueId].value = ''
    }

    if (tempD[dataForm[3].valueId].value !== dataForm[3].options[1].opId) {
      tempD[dataForm[4].valueId].value = ''
      tempD[dataForm[5].valueId].value = ''
      tempD[dataForm[6].valueId].value = ''
    }

    if (tempD[dataForm[2].valueId].value !== dataForm[2].options[1].opId) {
      tempD[dataForm[3].valueId].value = ''
      tempD[dataForm[4].valueId].value = ''
      tempD[dataForm[5].valueId].value = ''
      tempD[dataForm[6].valueId].value = ''
    }

    // if (tempD[dataForm[7].valueId].value) {
    //   if (tempD[dataForm[7].valueId].value.indexOf(indsForInvasive[4]) > -1) {
    //     tempD[dataForm[7].valueId].value = manageFreeText(
    //       usRef.current.value,
    //       tempD[dataForm[7].valueId].value,
    //       indsForInvasive[4]
    //     )
    //   }

    //   if (tempD[dataForm[7].valueId].value.indexOf(indsForInvasive[9]) > -1) {
    //     tempD[dataForm[7].valueId].value = manageFreeText(
    //       otherRef.current.value,
    //       tempD[dataForm[7].valueId].value,
    //       indsForInvasive[9]
    //     )
    //   }
    // }

    if (tempD[dataForm[8].valueId].value !== dataForm[8].options[1].opId) {
      tempD[dataForm[9].valueId].value = ''
    }

    if (tempD[dataForm[10].valueId].value !== dataForm[10].options[4].opId) {
      tempD[dataForm[11].valueId].value = ''
    }

    if (tempD[dataForm[10].valueId].value === dataForm[10].options[4].opId) {
      tempD[dataForm[11].valueId].value = replaceNewLineWithBr(
        tempD[dataForm[11].valueId].value
      )
    }

    if (tempD[dataForm[6].valueId].value.trim()) {
      let v = tempD[dataForm[6].valueId].value
      tempD[dataForm[6].valueId].value =
        v.indexOf(dataForm[6].unit) > -1 ? v : v + ' ' + dataForm[6].unit
    }

    // console.log(tempD)
    return tempD
  }

  function cleanData2(data) {
    let tempD = { ...data }

    if (tempD[data1Form[0].valueId].value !== data1Form[0].options[1].opId) {
      tempD[data1Form[1].valueId].value = ''
    }

    if (tempD[data1Form[3].valueId].value !== data1Form[3].options[5].opId) {
      tempD[data1Form[4].valueId].value = ''
    }

    tempD[data1Form[13].valueId].value = ''
    if (tempD[data1Form[12].valueId].value === data1Form[12].options[1].opId) {
      tempD[data1Form[13].valueId].value = complicationRef.current.value
    }

    return tempD
  }

  function cleanData3(data) {
    let tempD = { ...data }
    // console.log(data1Form)
    if (tempD[data1Form[0].valueId].value !== data1Form[0].options[1].opId) {
      tempD[data1Form[1].valueId].value = ''
    }

    if (tempD[data1Form[3].valueId].value !== data1Form[3].options[6].opId) {
      tempD[data1Form[4].valueId].value = ''
    }

    tempD[data1Form[11].valueId].value = ''
    if (tempD[data1Form[10].valueId].value === data1Form[10].options[1].opId) {
      tempD[data1Form[11].valueId].value = complicationRef.current.value
    }
    return tempD
  }

  function cleanData4(data) {
    let tempD = { ...data }
    if (tempD[data1Form[1].valueId].value !== data1Form[1].options[5].opId) {
      tempD[data1Form[2].valueId].value = ''
    }

    tempD[data1Form[11].valueId].value = ''
    if (tempD[data1Form[10].valueId].value === data1Form[10].options[1].opId) {
      tempD[data1Form[11].valueId].value = complicationRef.current.value
    }
    return tempD
  }

  function cleanData5(data) {
    let tempD = { ...data }
    if (tempD[data1Form[1].valueId].value !== data1Form[1].options[5].opId) {
      tempD[data1Form[2].valueId].value = ''
    }

    tempD[data1Form[18].valueId].value = ''
    if (tempD[data1Form[17].valueId].value === data1Form[17].options[1].opId) {
      tempD[data1Form[18].valueId].value = complicationRef.current.value
    }
    return tempD
  }

  async function saveData() {
    try {
      let tempD = cleanData(dataFormSend)
      let newForm = cleanUpForm(tempD)

      /// SAVE TO STORAGE FOR AUTO SAVE BEFORE PREVIEW
      storeBackupData(tempD)

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

  function renderProcedure(pname) {
    // console.log(pname)
    if (!pname) return

    let component = null
    switch (pname) {
      case 'Amniocentesis':
        component = (
          <Amniocentesis
            form={procedure[pname]}
            handleChange={handleChange}
            showUterusText={showUterusText}
            showInstrumentText={showInstrumentText}
            setSnackWarning={setSnackWarning}
            amnioticRef={amnioticRef}
            complicationRef={complicationRef}
            setDataFormSend={setProcedureDataFormSend}
            manageFreeText={manageFreeText}
          />
        )
        break

      case 'CVS':
        component = (
          <CVS
            form={procedure[pname]}
            handleChange={handleChange}
            showUterusText={showUterusText}
            showInstrumentText={showInstrumentText}
            setSnackWarning={setSnackWarning}
            amnioticRef={amnioticRef}
            complicationRef={complicationRef}
            setDataFormSend={setProcedureDataFormSend}
            manageFreeText={manageFreeText}
          />
        )
        break
      case 'Cordocentesis':
        component = (
          <Cordocentesis
            form={procedure[pname]}
            handleChange={handleChange}
            showInstrumentText={showInstrumentText}
            setSnackWarning={setSnackWarning}
            amnioticRef={amnioticRef}
            complicationRef={complicationRef}
            setDataFormSend={setProcedureDataFormSend}
            manageFreeText={manageFreeText}
          />
        )
        break
      case 'Intrauterine Transfusion':
        component = (
          <IntrauterineTransfusion
            form={procedure[pname]}
            handleChange={handleChange}
            showInstrumentText={showInstrumentText}
            setSnackWarning={setSnackWarning}
            amnioticRef={amnioticRef}
            complicationRef={complicationRef}
            setDataFormSend={setProcedureDataFormSend}
            manageFreeText={manageFreeText}
          />
        )
        break

      default:
        break
    }

    return component
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
          <div style={{ width: 750 }}>
            {dataForm.length > 0 && (
              <>
                <Box sx={{ m: inputMargin, width: '100%' }}>
                  <Button
                    variant={
                      btnActive.prerequisite.active ? 'contained' : 'outlined'
                    }
                    size='large'
                    color='info'
                    onClick={() => {
                      setBtnActive(prev => ({
                        prerequisite: { ...prev.prerequisite, active: true },
                        procedure: {
                          ...prev.procedure,
                          active: false,
                        },
                      }))

                      prerequisiteRef.current.style.display = 'block'
                      procedureRef.current.style.display = 'none'
                      resetData()
                      initData()
                      // updateDataChange('0')
                      // updateProcedureDataChange('0')
                    }}
                  >
                    Prerequisite Data
                  </Button>
                  {btnActive.procedure.show && (
                    <Button
                      sx={{ ml: 1 }}
                      variant={
                        btnActive.procedure.active ? 'contained' : 'outlined'
                      }
                      size='large'
                      color='info'
                      onClick={() => {
                        setBtnActive(prev => ({
                          prerequisite: { ...prev.prerequisite, active: false },
                          procedure: {
                            ...prev.procedure,
                            active: true,
                          },
                        }))

                        procedureRef.current.style.display = 'block'
                        prerequisiteRef.current.style.display = 'none'
                        autoSave(backupData)
                      }}
                    >
                      {btnActive.procedure.name}
                    </Button>
                  )}
                </Box>

                <div ref={prerequisiteRef}>
                  <div
                    ref={prerequisiteRef}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      width: '100%',
                      marginTop: 0,
                      marginLeft: 10,
                    }}
                  >
                    <Box sx={{ m: inputMargin }}>
                      <SelectField
                        value={
                          patient?.lmpGa === dataForm[0].content
                            ? optionsGA[0].opId
                            : patient?.edcGa === dataForm[0].content
                            ? optionsGA[1].opId
                            : patient?.usGa === dataForm[0].content
                            ? optionsGA[2].opId
                            : dataForm[0].content === ''
                            ? ''
                            : optionsGA[3].opId
                        }
                        handleChange={e =>
                          handleChange(e, {
                            ...dataForm[0],
                            selectOption: true,
                          })
                        }
                        form={{
                          ...dataForm[0],
                          options: optionsGA,
                        }}
                        minWidth={160}
                      />
                      <InputTextField
                        inputRef={gaRef}
                        value={dataForm[0].content}
                        handleChange={e => handleChange(e, dataForm[0])}
                        form={{ ...dataForm[0], name: '' }}
                        width={162}
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    <Box sx={{ m: inputMargin }}>
                      <SelectField
                        value={dataForm[1].contentOption || ''}
                        handleChange={e => handleChange(e, dataForm[1])}
                        form={dataForm[1]}
                      />
                    </Box>

                    <Box sx={{ m: inputMargin }}>
                      <SelectField
                        value={dataForm[2].contentOption || ''}
                        handleChange={e => handleChange(e, dataForm[2])}
                        form={dataForm[2]}
                      />
                    </Box>

                    {showOptions.indirectCoombsTest && (
                      <Box sx={{ m: inputMargin }}>
                        <SelectField
                          value={dataForm[3].contentOption || ''}
                          handleChange={e => handleChange(e, dataForm[3])}
                          form={dataForm[3]}
                        />
                      </Box>
                    )}

                    {showOptions.antiDtiter && (
                      <>
                        <Box sx={{ m: inputMargin }}>
                          <InputTextField
                            value={dataForm[4].content}
                            handleChange={e => handleChange(e, dataForm[4])}
                            form={dataForm[4]}
                          />
                        </Box>
                        <Box sx={{ m: inputMargin }}>
                          <SelectField
                            value={dataForm[5].contentOption || ''}
                            handleChange={e => handleChange(e, dataForm[5])}
                            form={dataForm[5]}
                            minWidth={180}
                          />
                          {showOptions.antiDimmunUnit && (
                            <InputTextField
                              value={dataForm[6].content?.split(' ')[0] || ''}
                              handleChange={e => handleChange(e, dataForm[6])}
                              form={{ ...dataForm[6], name: '' }}
                              width={142}
                              sx={{ ml: 1 }}
                              endAdornment={
                                <InputAdornment position='end'>
                                  <div
                                    style={{ fontSize: 13, marginRight: -10 }}
                                  >
                                    {dataForm[6].unit}
                                  </div>
                                </InputAdornment>
                              }
                            />
                          )}
                        </Box>
                      </>
                    )}
                    <Box sx={{ m: inputMargin, width: '91%' }}>
                      <Divider textAlign='left'>
                        <Typography variant='h5'>
                          Indications for invasive procedure
                        </Typography>
                      </Divider>
                    </Box>

                    {indsForInvasive.map((cname, index) => {
                      return CheckBox({
                        ...dataForm[7],
                        cname,
                        index,
                      })
                    })}
                    <Box sx={{ m: inputMargin, mb: 0, mt: 1.5, width: '91%' }}>
                      <Divider />
                    </Box>
                    <Box sx={{ m: inputMargin, width: '100%', mt: 2 }}>
                      <SelectField
                        value={dataForm[8].contentOption || ''}
                        handleChange={e => handleChange(e, dataForm[8])}
                        form={dataForm[8]}
                        minWidth={160}
                      />
                      {showContrainText && (
                        <InputTextField
                          value={dataForm[9].content}
                          handleChange={e => handleChange(e, dataForm[9])}
                          form={{ ...dataForm[9], name: '' }}
                          width={250}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ m: inputMargin, width: '91%' }}>
                      <Divider />
                    </Box>
                    <Box sx={{ m: inputMargin, width: '100%' }}>
                      <SelectField
                        value={dataForm[10].contentOption || ''}
                        handleChange={async e => {
                          handleChange(e, dataForm[10])

                          let value = e.target.value

                          let otherId = dataForm[10].options[4].id

                          if (value && value !== otherId) {
                            let pname = dataForm[10].options.find(
                              o => o.opId === value
                            ).name
                            // console.log(pname)
                            await getProcedureForm(pname)
                            await autoSave(backupData)
                            // updateDataChange('1')
                          }
                        }}
                        form={dataForm[10]}
                        minWidth={418}
                      />
                    </Box>
                    {showOtherProcedure && (
                      <Box sx={{ m: inputMargin, width: '100%' }}>
                        <CommentField
                          minWidth={418}
                          value={dataForm[11].content}
                          handleChange={e => handleChange(e, dataForm[11])}
                          form={{ ...dataForm[11], name: '' }}
                        />
                      </Box>
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
                </div>

                <div ref={procedureRef} style={{ display: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      width: '100%',
                      marginTop: 0,
                      marginLeft: 10,
                    }}
                  >
                    {procedure[btnActive.procedure.name] &&
                      btnActive.procedure.active &&
                      renderProcedure(btnActive.procedure.name)}
                  </div>
                </div>
              </>
            )}
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

export default Invasive
