import { useEffect, useState, useRef } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
// import LinearProgress from '@mui/material/LinearProgress'
import CheckIcon from '@mui/icons-material/Check'
import Divider from '@mui/material/Divider'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

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
  replaceNewLineWithBr,
  updateDataChange,
} from '../../helper'
import { formDataToObject2, reFormatNumber, sleep } from '../../../../utils'
import CommentField from '../../../../components/page-tools/CommentField'
import SelectField from '../../../../components/page-tools/SelectField'
import AutoCompleteField from '../../../../components/page-tools/AutoCompleteField'
import InputTextField from '../../../../components/page-tools/InputTextField'
import {
  storeBackupData,
  storeBackupData2,
  initFormSend,
} from '../../report-utils'
import Details from './early-abnormal/Details'
import { qsa } from '../../../../utils/domUtils'
// import indications from '../../../../data/indications'

const flexCenter = { display: 'flex', alignItems: 'center' }

const Accordion = styled(props => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const AccordionSummary = styled(props => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

const bgcolorStyle = {
  bgcolor: theme => (theme.palette.mode === 'dark' ? '#323232' : '#f9f9f9'),
}
const bgcolorStyleH = {
  bgcolor: theme => (theme.palette.mode === 'dark' ? '#252525' : '#eef6f5'),
}

const templateId = TEMPLATES.fetalEcho.id
const templateCardiacId = TEMPLATES.cardiacFunction.id
let backupData = null
let backupCardiacData = null
let longitudialStrainIdArr = []
let cardiacFunctionId = null
let shortAxisId = null
let masterForm = null
let abnormalId = []
let abnName = ['Other', 'Present', 'VSD', 'ASD', 'Discordance', 'Abnormal']

const FetalEcho = ({ patient }) => {
  // useEffect(() => {
  //   let inds1 = indications
  //     .split('\n')
  //     .slice(0, 6)
  //     .map(i => i.trim())
  //   let inds2 = indications
  //     .split('\n')
  //     .slice(6)
  //     .map(i => i.trim())
  //     .sort()
  //   let start = 77
  //   let inds = [...inds1, ...inds2]

  //   let sql = ''
  //   inds2.map((v, i) => {

  //     sql += `INSERT INTO OB_MASTER_OPTIONS (OP_NAME,OP_STATUS,REF_VALUE_ID,REF_TEMPLATE_ID,OP_ORDER,OP_DISPLAY_CONTENT,OP_CREATE_BY)
  //     VALUES ('Indication','A',1847,9,${++start},'${v}','')
  //     GO \n`
  //   })

  //   console.log(sql)
  // }, [])

  const [shortAxisContent, setShortAxisContent] = useState([])
  const [shortAxisValueId, setShortAxisValueId] = useState(null)
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  // const [dataCardiac, setDataCardiac] = useState(null)
  const [dataCardiacForm, setDataCardiacForm] = useState([])
  const [dataCardiacFormSend, setDataCardiacFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState({})

  const formRef = useRef(null)
  const atrialRateRef = useRef(null)
  const ventricularRateRef = useRef(null)
  const eaRatioRef = useRef(null)
  const eeRatioRef = useRef(null)
  const longitudialStrainRef = useRef(null)
  const lsRef = {
    'RV strain': useRef(null),
    'RV strain rate': useRef(null),
    'LV strain': useRef(null),
    'LV strain rate': useRef(null),
  }
  const circumferentialStrainRef = useRef(null)
  const csRef = {
    'RV strain': useRef(null),
    'RV strain rate': useRef(null),
    'LV strain': useRef(null),
    'LV strain rate': useRef(null),
  }
  const shortAxisRef = useRef(null)

  // Other Present VSD ASD Discordance
  let elRef = {
    '4 Chamber View': { div: useRef(null), input: useRef(null) },
    'Pericardial Effusion': { div: useRef(null), input: useRef(null) },
    'Intracardiac Echogenic Foci': { div: useRef(null), input: useRef(null) },
    'Ventricular Septum': { div: useRef(null), input: useRef(null) },
    'Atrial Septum': { div: useRef(null), input: useRef(null) },
    'Foramen Ovale': { div: useRef(null), input: useRef(null) },
    'AV Junctions': { div: useRef(null), input: useRef(null) },
    'Tricuspid Valves': { div: useRef(null), input: useRef(null) },
    'Mitral Valves': { div: useRef(null), input: useRef(null) },
    LVOT: { div: useRef(null), input: useRef(null) },
    'Aotic Valve': { div: useRef(null), input: useRef(null) },
    RVOT: { div: useRef(null), input: useRef(null) },
    'Pulmonic Valve': { div: useRef(null), input: useRef(null) },
    'Aortic Arch': { div: useRef(null), input: useRef(null) },
    'Ductal Arch and DA': { div: useRef(null), input: useRef(null) },
    'MPA and Branches PA': { div: useRef(null), input: useRef(null) },
    'Pulmonary Veins': { div: useRef(null), input: useRef(null) },
    'SVC and IVC': { div: useRef(null), input: useRef(null) },
    'Ductus Venosus': { div: useRef(null), input: useRef(null) },
    'Rate and Rhythm': { div: useRef(null), input: useRef(null) },
  }

  const InputText = (form, data, ref, componentOption, showFreetext = true) => {
    let display = 'none'
    let width = form?.width ? form.width : 314
    // console.log(ref)
    const elRef = ref?.div
    const inputRef = ref?.input
    let placeHolder = 'Free text...'
    // console.log(form)

    let value = ''
    const test = data.find(data => data.refValueId === form.valueId)
    if (test && test.contentOption) {
      value = test.contentOptionFreeText
      let opId = test.contentOption

      let check = form.options.find(option => option.opId === opId)?.name || ''

      if (abnName.includes(check)) display = 'block'

      if (['Ventricular Septum', 'Pericardial Effusion'].includes(form.name)) {
        value =
          form.name === 'Pericardial Effusion'
            ? value.split(' ')[0]
            : value.split(' ')[1]
        placeHolder = ''
      }
    }

    return (
      <div ref={elRef} style={{ display }}>
        {componentOption}
        {showFreetext && (
          <div style={flexCenter}>
            {form.inputName && (
              <div style={{ marginLeft: 17 }}>{form.inputName}</div>
            )}
            <TextField
              autoComplete='off'
              placeholder={placeHolder}
              inputRef={inputRef}
              name={form.valueId + ''}
              size='small'
              variant='outlined'
              // InputProps={{
              //   readOnly,
              // }}
              inputProps={{
                'data-name': 'freetext',
                // 'data-unit': form.unit || '',
                style: {
                  paddingLeft: 7,
                  ...form?.style,
                },
              }}
              sx={{
                ...inputStyle,
                width,
                ml: 2,
                mt: 0.3,
                borderRadius: 1,
                backgroundColor: theme =>
                  theme.palette.mode === 'light' ? 'white' : '#393939',
              }}
              defaultValue={value}
              onChange={e => handleChange(e, { ...form, isFreetext: true })}
            />
            <Box
              sx={{
                color: theme =>
                  theme.palette.mode === 'dark' ? 'lightblue' : 'blue',
              }}
            >
              {form.unit}
            </Box>
            &nbsp;
            {form?.optionText || ''}
          </div>
        )}
      </div>
    )
  }

  const CheckBox = (form, data, width = 190) => {
    let { cname } = form
    let value = []
    const test = data.find(data => data.refValueId === form.valueId)
    if (test && test.contentOptionCheckBox) {
      value = test.contentOptionCheckBox?.split(', ')
    }
    return (
      <FormControlLabel
        control={
          <Checkbox
            name={cname}
            checked={value.includes(cname)}
            sx={{ p: 0.5 }}
            // inputProps={{ 'data-value': label, 'data-name': name }}
            onChange={e => handleChange(e, { ...form, cname })}
          />
        }
        label={cname}
        sx={{
          m: 0,
          width,
        }}
      />
    )
  }

  const OptionText = (form, data, width = 70) => {
    let defaultValue = ''
    let name = form.fname

    let test = data
      .find(
        d =>
          d.refValueId === form.valueId &&
          d.contentOptionCheckBox.indexOf(name) > -1
      )
      ?.contentOptionCheckBox?.split(', ')
      .filter(d => d.indexOf(name) > -1)

    if (test?.length > 0) {
      // console.log(test[0])
      test = test[0]?.split('/')[0]?.split(' ')[2]
      defaultValue = test
    }

    return (
      <div style={flexCenter}>
        {name}{' '}
        <TextField
          autoComplete='off'
          inputRef={name === 'Atrial Rate' ? atrialRateRef : ventricularRateRef}
          size='small'
          variant='outlined'
          inputProps={{
            // 'data-name': name === 'Present' ? 'freetext' : '',
            style: {
              paddingRight: 7,
              textAlign: 'right',
            },
          }}
          sx={{
            ...inputStyle,
            width,
            mt: 0.3,
            borderRadius: 1,
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={defaultValue}
          onChange={e =>
            handleChange(e, {
              ...form,
              fname: name,
            })
          }
        />
        <Box
          sx={{
            color: theme =>
              theme.palette.mode === 'dark' ? 'lightblue' : 'blue',
          }}
        >
          {form.unit}
        </Box>
        &nbsp;
        {form?.optionText || ''}
      </div>
    )
  }

  const CardiacInputText = (form, width = 60) => {
    let inputRef = undefined
    let readOnly = ['E/A ratio', "e'/E ratio"].includes(form.display)
    let textAlign = { textAlign: 'right' }

    if (form.display === 'E/A ratio') {
      inputRef = eaRatioRef
    } else if (form.display === "e'/E ratio") {
      inputRef = eeRatioRef
    } else if (form.name === 'Longitudial Strain') {
      inputRef = lsRef[form.display]
    } else if (form.name === 'Circumferential Strain') {
      inputRef = csRef[form.display]
    }

    return (
      <>
        <div style={{ marginLeft: 5, width: 105 }}>{form.display}</div>
        <TextField
          autoComplete='off'
          inputRef={inputRef}
          name={form.valueId + ''}
          size='small'
          variant='outlined'
          InputProps={{
            readOnly,
          }}
          inputProps={{
            'data-name': form.display,
            'data-unit': form.unit || '',
            style: {
              ...textAlign,
              padding: 5,
              paddingRight: 7,
            },
          }}
          sx={{
            ...inputStyle,
            width,
            height: 32,
            mb: 0.5,
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={form.content || ''}
          onChange={e => handleCardiacChange(e, form)}
        />
        &nbsp;
        <Box
          sx={{
            color: theme =>
              theme.palette.mode === 'dark' ? 'lightblue' : 'blue',
          }}
        >
          {form.unit}
        </Box>
      </>
    )
  }

  //for select filter
  const [indication, setIndication] = useState(null)

  const [snackWarning, setSnackWarning] = useState({
    show: false,
    message: null,
    autoHideDuration: 1500,
    severity: null,
  })

  const [expanded1, setExpanded1] = useState('')
  const [expanded2, setExpanded2] = useState('')

  const handleChangeAccordion1 = panel => (event, newExpanded) => {
    setExpanded1(newExpanded ? panel : false)
  }

  const handleChangeAccordion2 = panel => (event, newExpanded) => {
    setExpanded2(newExpanded ? panel : false)
  }

  useEffect(() => {
    resetData()
    initData()
    updateDataChange('0')

    return () => {
      let cardiacText = combineCardiacFunction(masterForm)
      let bd = {
        ...backupData,
        [cardiacFunctionId]: { type: 'T', value: cardiacText },
      }

      autoSave(bd)
      autoSave(backupCardiacData)
      // saveData(backupData, backupCardiacData)
      backupData = null
      backupCardiacData = null
    }

    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (dataForm.length > 0) {
      let showLS =
        dataCardiacForm
          .filter(d => d.name === 'Longitudial Strain')
          .map(d => d.content)
          .reduce((acc, cv) => acc + cv, '') !== ''

      let showCS =
        dataCardiacForm
          .filter(d => d.name === 'Circumferential Strain')
          .map(d => d.content)
          .reduce((acc, cv) => acc + cv, '') !== ''

      let showSA =
        dataCardiacForm
          .filter(d => d.display === 'Short Axis')
          .map(d => d.content)[0] !== ''

      longitudialStrainIdArr = dataCardiacForm
        .filter(d => d.name === 'Longitudial Strain')
        .map(d => d.valueId)

      cardiacFunctionId = dataForm
        .filter(d => d.name === 'Cardiac Function')
        .map(d => d.valueId)[0]

      masterForm = dataCardiacForm

      abnormalId = dataForm
        .filter(
          d =>
            d.options?.length > 0 &&
            d.options.find(option => abnName.includes(option.name))
        )
        .map(option => option.options)
        .flat()
        .filter(option => abnName.includes(option.name))

      // console.log(abnormalId)

      setTimeout(() => {
        longitudialStrainRef.current.style.display = showLS ? 'block' : 'none'
        circumferentialStrainRef.current.style.display = showCS
          ? 'block'
          : 'none'
        shortAxisRef.current.style.display = showSA ? 'block' : 'none'
      }, 50)
    }

    return () => {}
    // eslint-disable-next-line
  }, [dataForm])

  function resetData() {
    setData(null)
    setDataForm([])
    setIndication(null)
    setDataFormSend([])
  }

  function initData() {
    setLoading(true)
    const rand = randomMs()
    sleep(rand).then(async () => {
      if (!REPORT_ID[TEMPLATES.fetalEcho.name][patient.currentFetus]) {
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateId
        )

        REPORT_ID[TEMPLATES.fetalEcho.name][patient.currentFetus] = id
      }

      if (!REPORT_ID[TEMPLATES.cardiacFunction.name][patient.currentFetus]) {
        const id = await getReportId(
          patient.accession,
          patient.currentFetus,
          templateCardiacId
        )

        REPORT_ID[TEMPLATES.cardiacFunction.name][patient.currentFetus] = id
      }

      fetchData()
    })
  }

  async function fetchData() {
    try {
      let res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(
            TEMPLATES.cardiacFunction.name,
            patient.currentFetus
          ),
        },
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem(
            STORAGE_NAME.token
          )}`,
        },
      })

      // setDataCardiac(res.data.data)
      getReportCardiacForm(res.data.data)

      res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.fetalEcho.name, patient.currentFetus),
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

  async function getReportCardiacForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.cardiacFunction.name, patient.currentFetus),
      templateCardiacId
    )

    // console.log(data)
    // console.log(form)

    let tempArr = form.map(f => {
      let t = data.find(d => d.refValueId === f.valueId)
      if (t) return { ...f, content: t.content }

      return { ...f, content: '' }
    })

    setShortAxisContent(
      tempArr.find(d => d.display === 'Short Axis')?.content?.split(',') || []
    )

    let saId = tempArr.find(d => d.display === 'Short Axis').valueId
    setShortAxisValueId(saId)
    shortAxisId = saId

    // console.log(formSend)
    // console.log(tempArr)
    setDataCardiacForm(tempArr)

    setDataCardiacFormSend(formSend)
    backupCardiacData = formSend
    storeBackupData2(formSend)
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.fetalEcho.name, patient.currentFetus),
      templateId
    )

    let hasIndication = false
    let indicationId, indicationName
    data.forEach(d => {
      if (d.contentValueName === 'Reason/Indications') {
        hasIndication = true
        indicationId = d.contentOption
        indicationName = d.content
      }
    })

    if (hasIndication) {
      const objIndication = form
        .find(f => f.name === 'Reason/Indications')
        .options.find(
          op => op.name === indicationName || op.id === indicationId
        )

      setIndication(objIndication)
    }

    // console.log(data)
    // console.log(form)
    // console.log(formSend)
    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleCardiacChange(e, d) {
    updateDataChange('1')
    let { value, checked } = e.target
    // console.log(value)
    // console.log(d)

    if (d.cname === 'Longitudial Strain') {
      longitudialStrainRef.current.style.display = checked ? 'block' : 'none'
    } else if (d.cname === 'Circumferential Strain') {
      circumferentialStrainRef.current.style.display = checked
        ? 'block'
        : 'none'
    } else if (d.cname === 'Short Axis') {
      shortAxisRef.current.style.display = checked ? 'block' : 'none'
    }

    setTimeout(() => {
      const data = qsa(['input', 'select', 'checkbox'], formRef.current)
      let newForm = formDataToObject2(data)
      // console.log('newForm', newForm)

      if (['E velocity', 'A velocity', "e' velocity"].includes(d.display)) {
        let eVelo =
          newForm[dataCardiacForm.find(n => n.display === 'E velocity').valueId]
            .value
        let aVelo =
          newForm[dataCardiacForm.find(n => n.display === 'A velocity').valueId]
            .value

        let eaRatio = reFormatNumber(parseFloat(eVelo) / parseFloat(aVelo))

        eaRatioRef.current.value =
          eVelo && aVelo && eaRatio && eaRatio !== '∞' ? eaRatio : ''

        let eeVelo =
          newForm[
            dataCardiacForm.find(n => n.display === "e' velocity").valueId
          ].value

        let eeRatio = reFormatNumber(parseFloat(eeVelo) / parseFloat(eVelo))

        eeRatioRef.current.value =
          eVelo && eeVelo && eeRatio && eeRatio !== '∞' ? eeRatio : ''
      }

      setDataCardiacFormSend(prev => {
        let temp = {}

        Object.keys(prev).forEach(key => {
          temp[key] = { type: 'T', value: newForm[key]?.value || '' }
        })

        temp['reportId'] = prev.reportId

        let shortAxis = []
        for (let i = 1; i <= 3; i++) {
          if (newForm[shortAxisValueId + (i + '')].value)
            shortAxis.push(newForm[shortAxisValueId + (i + '')].value)
        }

        temp[shortAxisValueId].value = shortAxis.join(',')

        if (
          d.cname === 'Circumferential Strain' ||
          d.valueId === shortAxisValueId
        ) {
          if (d.cname === 'Short Axis' && !checked) {
            value = ''
          } else {
            value = shortAxis.join(',')
          }
        }

        if (d.cname === 'Circumferential Strain' && !checked) {
          Object.keys(csRef).forEach(key => (csRef[key].current.value = ''))

          for (let i = 0; i <= 4; i++) {
            let id = shortAxisValueId + (i === 0 ? '' : i)
            temp[id].value = ''
          }

          value = ''
        } else if (d.cname === 'Longitudial Strain' && !checked) {
          Object.keys(lsRef).forEach(key => (lsRef[key].current.value = ''))

          for (let i = 0; i <= 3; i++) {
            let id = longitudialStrainIdArr[i]
            temp[id].value = ''
          }
          d['valueId'] = longitudialStrainIdArr[0]
          value = ''
        }

        temp = {
          ...temp,
          [d.valueId]: {
            ...prev[d.valueId],
            value,
          },
        }

        // console.log(temp)
        backupCardiacData = temp
        storeBackupData2(temp)
        return temp
      })

      setDataFormSend(prev => {
        let temp = { ...prev }
        let cardiacText = combineCardiacFunction(masterForm)

        temp = {
          ...temp,
          [cardiacFunctionId]: { type: 'T', value: cardiacText },
        }

        backupData = temp
        storeBackupData(temp)
        return temp
      })
    }, 50)
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
      setIndication(newValue)
    } else {
      // console.log(e)

      let { dataset, value, type, checked } = e.target

      let checkAbnormal = null
      // console.log(type, checked, d.cname, dataFormSend[d.valueId])
      //d.fname
      let v =
        d.name === 'Comments'
          ? replaceNewLineWithBr(value)
          : ['T', 'S'].includes(d.type)
          ? value
          : ''

      let prevCheckbox = []
      let cbox = dataFormSend[d.valueId]?.checkbox || ''

      if (type === 'checkbox' || d.fname) {
        prevCheckbox = dataFormSend[d.valueId].checkbox?.split(', ') || []

        if (d.name === 'Rate and Rhythm' && d.fname) {
          // console.log(d.name, value)
          let t = `${d.fname} ${value}/min`
          // console.log(t)
          let index = d.fname === 'Atrial Rate' ? 0 : 1
          let tc =
            d.fname === 'Atrial Rate'
              ? prevCheckbox.find(p => p.indexOf('Atrial Rate') > -1)
              : prevCheckbox.find(p => p.indexOf('Ventricular Rate') > -1)
          if (tc) {
            prevCheckbox =
              d.fname === 'Atrial Rate'
                ? prevCheckbox.filter(p => p.indexOf('Atrial Rate') === -1)
                : prevCheckbox.filter(p => p.indexOf('Ventricular Rate') === -1)
          }

          if (value) {
            // console.log(t)
            prevCheckbox.splice(index, 0, t)
            prevCheckbox = prevCheckbox.filter(p => p !== '')
            // console.log(prevCheckbox)
          }
        } else {
          if (checked) {
            if (prevCheckbox[0] === '') prevCheckbox[0] = d.cname
            else prevCheckbox.push(d.cname)
          } else {
            prevCheckbox.splice(prevCheckbox.indexOf(d.cname), 1)
          }
        }

        cbox = prevCheckbox.join(', ')
        // console.log(cbox)

        setData(prev => {
          let checkExist = prev.find(p => p.refValueId === d.valueId)
          if (checkExist) {
            return prev.map(t => {
              if (t.refValueId === d.valueId)
                return {
                  ...t,
                  contentOptionCheckBox: cbox,
                }

              return t
            })
          } else {
            let n = d.options.find(option => option.name === 'Abnormal')
            let newArr = {
              content: '',
              contentFreeValueName: '',
              contentFreeValueUnit: '',
              contentOption: n.opId,
              contentOptionCheckBox: cbox,
              contentOptionFreeText: '',
              contentUnit: '',
              contentValueName: n.opName,
              refValueId: d.valueId,
            }
            return [...prev, newArr]
          }
        })
      }

      let ftext = dataFormSend[d.valueId]?.freetext || ''
      if (dataset?.name === 'freetext' && type !== 'checkbox') {
        ftext = value
        if (d.name === 'Pericardial Effusion') {
          ftext = `${value} mm. thick`
        } else if (d.name === 'Ventricular Septum') {
          ftext = `Size ${value} mm.`
        }
      }

      if (d.options?.length > 0 && !dataset && type !== 'checkbox') {
        // console.log(v)
        // console.log(d)
        checkAbnormal = d.options.find(option => option.opId === v)?.name
        if (abnName.includes(checkAbnormal)) {
          // console.log(checkAbnormal)
          if (elRef[d.name]) elRef[d.name].div.current.style.display = 'block'

          setData(prev => {
            let checkExist = prev.find(p => p.refValueId === d.valueId)
            if (checkExist) {
              return prev.map(t => {
                if (t.refValueId === d.valueId)
                  return {
                    ...t,
                    contentOption: v,
                  }

                return t
              })
            } else {
              let newArr = {
                content: '',
                contentFreeValueName: '',
                contentFreeValueUnit: '',
                contentOption: v,
                contentOptionCheckBox: '',
                contentOptionFreeText: '',
                contentUnit: '',
                contentValueName: d.name,
                refValueId: d.valueId,
              }
              let newObj = [...prev, newArr]
              return newObj
            }
          })
        } else {
          if (elRef[d.name]) {
            elRef[d.name].div.current.style.display = 'none'

            if (elRef[d.name].input.current)
              elRef[d.name].input.current.value = ''

            if (d.name === 'Rate and Rhythm') {
              atrialRateRef.current.value = ''
              ventricularRateRef.current.value = ''
            }

            setData(prev => {
              let checkExist = prev.find(p => p.refValueId === d.valueId)
              if (checkExist) {
                // console.log('if')
                return prev.map(t => {
                  if (t.refValueId === d.valueId)
                    return {
                      ...t,
                      contentOption: v,
                      contentOptionCheckBox: '',
                      contentOptionFreeText: '',
                    }

                  return t
                })
              } else {
                // console.log('else')
                let newArr = {
                  content: '',
                  contentFreeValueName: '',
                  contentFreeValueUnit: '',
                  contentOption: v,
                  contentOptionCheckBox: '',
                  contentOptionFreeText: '',
                  contentUnit: '',
                  contentValueName: d.name,
                  refValueId: d.valueId,
                }
                let newObj = [...prev, newArr]
                // console.log(newObj)
                return newObj
              }
            })

            cbox = ''
            ftext = ''
          }
        }
      }

      setDataFormSend(prev => {
        let temp = { ...prev }
        let cardiacText = combineCardiacFunction(masterForm)

        temp = {
          ...temp,
          [cardiacFunctionId]: { type: 'T', value: cardiacText },
        }

        let n = abnormalId.find(ab => ab.opId === temp[d.valueId]?.value)?.name
        // console.log(n)
        let content = ''
        if (abnName.includes(n)) {
          let arr = [n === 'Other' ? '' : n, ...cbox.split(','), ftext]
            .filter(a => a?.trim() !== '')
            .map(a => a?.trim())
          content = arr.join(', ')
        }

        temp = {
          ...temp,
          [d.valueId]: {
            ...temp[d.valueId],
            value:
              dataset?.name === 'freetext' || type === 'checkbox' || d.fname
                ? temp[d.valueId].value
                : v,
            freetext: ftext,
            checkbox: cbox,
            content: content,
          },
        }
        // console.log(temp)

        backupData = temp
        storeBackupData(temp)
        return temp
      })
    }
  }

  function combineCardiacFunction(form) {
    let data = backupCardiacData
    let text1 = []
    let text2 = []
    let text3 = []
    let returnText = []
    // console.log(data)
    form
      .filter(f => f.name === 'Cardiac Function')
      .forEach(f => {
        if (data[f.valueId].value) {
          text1.push(`${f.display} ${data[f.valueId].value}${f.unit || ''}`)
        }
      })

    form
      .filter(f => f.name === 'Longitudial Strain')
      .forEach(f => {
        if (data[f.valueId].value) {
          text2.push(`${f.display} ${data[f.valueId].value}${f.unit || ''}`)
        }
      })

    form
      .filter(f => f.name === 'Circumferential Strain')
      .forEach(f => {
        if (f.valueId === shortAxisId) {
          if (data[f.valueId].value) {
            let t = 'Short Axis,' + data[f.valueId].value
            text3.push(t.split(',').join(', '))
          }
        } else {
          if (data[f.valueId].value) {
            text3.push(`${f.display} ${data[f.valueId].value}${f.unit || ''}`)
          }
        }
      })

    if (text1.length > 0) returnText.push(text1.join(', '))

    if (text2.length > 0)
      returnText.push(`Longitudial Strain: ` + text2.join(', '))

    if (text3.length > 0)
      returnText.push(`Circumferential Strain: ` + text3.join(', '))

    return returnText.join(`<br />`)
  }

  async function saveData(data1 = null, data2 = null) {
    try {
      const d1 = data1 || dataFormSend
      const d2 = data2 || dataCardiacFormSend
      let newForm = cleanUpForm(d1)
      let newForm2 = cleanUpForm(d2)
      storeBackupData(d1)
      storeBackupData2(d2)

      const res = await axios.post(API.REPORT_CONTENT, { reportData: newForm })
      const res2 = await axios.post(API.REPORT_CONTENT, {
        reportData: newForm2,
      })

      let message = 'Save Fail!'
      let severity = 'error'

      if (res.data.data && res2.data.data) {
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
      <div
        style={{
          display: loading && 'none',
        }}
      >
        <Fade in={!loading ? true : false} timeout={300}>
          <div>
            {data && dataForm?.length > 0 && dataCardiacForm?.length > 0 && (
              <>
                {dataForm
                  ?.filter(form => form.name === 'Reason/Indications')
                  .map((form, i) => {
                    // let value = ''
                    // form.options.forEach(op => {
                    //   console.log(data)
                    //   const test = data.find(
                    //     data => data.contentOption === op.opId
                    //   )
                    //   if (test) value = test.contentOption
                    // })

                    return (
                      <Box key={i} sx={{ m: inputMargin }}>
                        <AutoCompleteField
                          width={676}
                          ctrlValue={indication}
                          handleChange={(e, newValue) =>
                            handleChange(e, form, newValue, true)
                          }
                          form={form}
                          freeSolo={false}
                        />
                      </Box>
                    )
                  })}

                <Box
                  sx={{
                    display: 'flex',
                    columnGap: 0,
                    mt: 1.2,
                    width: 700,
                  }}
                >
                  <Box
                    sx={{
                      width: '50%',
                    }}
                  >
                    {dataForm
                      ?.filter(form => form.name !== 'Reason/Indications')
                      .map((form, i) => {
                        if (i % 2 === 0 && i <= 20) {
                          let value = ''
                          let controlled = false
                          form.options.forEach(op => {
                            const test = data.find(
                              data => data.contentOption === op.opId
                            )
                            if (test) value = test.contentOption
                          })

                          let componentOption = null
                          let showFreetext = true
                          let formOption = {}
                          if (form.name === 'Pericardial Effusion') {
                            formOption = {
                              width: 70,
                              unit: 'mm.',
                              optionText: 'thick',
                              style: { textAlign: 'right', paddingRight: 7 },
                            }
                            controlled = true
                          } else if (
                            form.name === 'Intracardiac Echogenic Foci'
                          ) {
                            controlled = true
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'RV',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'LV',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Both ventricles',
                                  },
                                  data
                                )}
                              </div>
                            )
                          } else if (form.name === 'Ventricular Septum') {
                            controlled = true
                            formOption = {
                              width: 70,
                              unit: 'mm.',
                              inputName: 'Size',
                              style: { textAlign: 'right', paddingRight: 7 },
                            }
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'AVSD',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Perimembranous',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Muscular',
                                  },
                                  data
                                )}
                              </div>
                            )
                          } else if (form.name === 'Atrial Septum') {
                            controlled = true
                            showFreetext = false
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Primum',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Secondum',
                                  },
                                  data
                                )}
                              </div>
                            )
                          } else if (
                            [
                              '4 Chamber View',
                              'Foramen Ovale',
                              'AV Junctions',
                            ].includes(form.name)
                          ) {
                            controlled = true
                          }

                          return (
                            <Box key={i} sx={{ m: inputMargin, mb: 2, mr: 0 }}>
                              <SelectField
                                value={value}
                                handleChange={e => handleChange(e, form)}
                                form={form}
                                // minWidth={i >= 26 ? 675 : undefined}
                                controlled={controlled}
                              />
                              {InputText(
                                {
                                  ...form,
                                  ...formOption,
                                },
                                data,
                                elRef[form.name],
                                componentOption,
                                showFreetext
                              )}
                            </Box>
                          )
                        }
                      })}
                    <Box sx={{ ml: 1, pr: 1.5, mb: 1 }}>
                      <Accordion
                        expanded={expanded1 === 'Atrio'}
                        onChange={handleChangeAccordion1('Atrio')}
                      >
                        <AccordionSummary sx={bgcolorStyleH}>
                          <Typography sx={{ mr: 1 }}>
                            Atrio-ventricular Valves
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails
                          sx={{ ...bgcolorStyle, mt: 0, pt: 0 }}
                        >
                          {dataForm
                            ?.filter(form =>
                              ['Tricuspid Valves', 'Mitral Valves'].includes(
                                form.name
                              )
                            )
                            .map((form, i) => {
                              let value = ''
                              form.options.forEach(op => {
                                const test = data.find(
                                  data => data.contentOption === op.opId
                                )
                                if (test) value = test.contentOption
                              })

                              let componentOption = (
                                <div style={{ marginLeft: 10 }}>
                                  {CheckBox(
                                    {
                                      ...form,
                                      cname: 'Tenosis',
                                    },
                                    data
                                  )}
                                  {CheckBox(
                                    {
                                      ...form,
                                      cname: 'Regurgitation',
                                    },
                                    data
                                  )}
                                  {CheckBox(
                                    {
                                      ...form,
                                      cname: 'Atresia',
                                    },
                                    data
                                  )}
                                  {CheckBox(
                                    {
                                      ...form,
                                      cname: 'Dysplasia',
                                    },
                                    data
                                  )}
                                </div>
                              )

                              return (
                                <Box key={i} sx={{ ml: -0.5, mt: 2 }}>
                                  <SelectField
                                    value={value}
                                    handleChange={e => handleChange(e, form)}
                                    form={form}
                                    minWidth={300}
                                    controlled={true}
                                  />

                                  {InputText(
                                    form,
                                    data,
                                    elRef[form.name],
                                    componentOption
                                  )}
                                </Box>
                              )
                            })}
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: '50%',
                      ml: -0.5,
                    }}
                  >
                    {dataForm
                      ?.filter(form => form.name !== 'Reason/Indications')
                      .map((form, i) => {
                        if (i % 2 !== 0 && i <= 22) {
                          let value = ''

                          let controlled = false
                          // console.log(form)
                          // let hasAbnormal = form.options.find(option =>
                          //   ['Abnormal', 'Other'].includes(option.name)
                          // )

                          form.options.forEach(op => {
                            const test = data.find(
                              data => data.contentOption === op.opId
                            )
                            if (test) {
                              value = test.contentOption
                            }
                          })

                          let componentOption = null
                          if (
                            ['Pulmonic Valve', 'Aotic Valve'].includes(
                              form.name
                            )
                          ) {
                            controlled = true
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Stenosis',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Dysplasia',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Regurgitation',
                                  },
                                  data
                                )}
                              </div>
                            )
                          } else if (form.name === 'Aortic Arch') {
                            controlled = true
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {CheckBox(
                                  { ...form, cname: 'Coarctation' },
                                  data
                                )}
                                {CheckBox(
                                  { ...form, cname: 'Right-sided' },
                                  data
                                )}
                                {CheckBox({ ...form, cname: 'Double' }, data)}
                              </div>
                            )
                          } else if (form.name === 'Ductal Arch and DA') {
                            controlled = true
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {CheckBox(
                                  { ...form, cname: 'Reverse flow in DA' },
                                  data
                                )}
                              </div>
                            )
                          } else if (form.name === 'Rate and Rhythm') {
                            controlled = true
                            componentOption = (
                              <div style={{ marginLeft: 10 }}>
                                {OptionText(
                                  {
                                    ...form,
                                    fname: 'Atrial Rate',
                                    unit: '/min',
                                  },
                                  data
                                )}
                                {OptionText(
                                  {
                                    ...form,
                                    fname: 'Ventricular Rate',
                                    unit: '/min',
                                  },
                                  data
                                )}

                                {CheckBox({ ...form, cname: 'PAC' }, data)}
                                {CheckBox(
                                  { ...form, cname: 'PAC with block' },
                                  data
                                )}
                                {CheckBox({ ...form, cname: 'PVC' }, data)}
                                {CheckBox({ ...form, cname: 'SVT' }, data)}
                                {CheckBox(
                                  {
                                    ...form,
                                    cname: 'Ventricular fibrillation',
                                  },
                                  data
                                )}
                                {CheckBox(
                                  { ...form, cname: 'Atrial flutter' },
                                  data
                                )}
                                {CheckBox(
                                  { ...form, cname: 'Atrial fibrillation' },
                                  data
                                )}
                                {CheckBox(
                                  { ...form, cname: '1st degree AV block' },
                                  data
                                )}
                                {CheckBox(
                                  { ...form, cname: '2nd degree AV block' },
                                  data
                                )}
                                {CheckBox(
                                  { ...form, cname: '3rd degree AV block' },
                                  data
                                )}
                              </div>
                            )
                          } else if (
                            [
                              'LVOT',
                              'RVOT',
                              'MPA and Branches PA',
                              'Pulmonary Veins',
                              'SVC and IVC',
                              'Ductus Venosus',
                            ].includes(form.name)
                          ) {
                            controlled = true
                          }

                          return (
                            <Box key={i} sx={{ m: inputMargin, mb: 2 }}>
                              <SelectField
                                value={value}
                                handleChange={e => handleChange(e, form)}
                                form={form}
                                // minWidth={i >= 26 ? 675 : undefined}
                                controlled={controlled}
                              />
                              {InputText(
                                form,
                                data,
                                elRef[form.name],
                                componentOption
                              )}
                            </Box>
                          )
                        }
                      })}
                    <Box sx={{ ml: 1, pr: 1.5, mb: 1 }}>
                      <Accordion
                        expanded={expanded2 === 'Cardiac'}
                        onChange={handleChangeAccordion2('Cardiac')}
                      >
                        <AccordionSummary sx={bgcolorStyleH}>
                          <Typography sx={{ mr: 1 }}>
                            Cardiac Function
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={bgcolorStyle}>
                          <form ref={formRef} autoComplete='off'>
                            {dataCardiacForm
                              .filter(data => data.name === 'Cardiac Function')
                              .map((form, i) => {
                                return (
                                  <div style={flexCenter} key={i}>
                                    {CardiacInputText(form)}
                                  </div>
                                )
                              })}
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name='Longitudial Strain'
                                  defaultChecked={
                                    dataCardiacForm
                                      .filter(
                                        d => d.name === 'Longitudial Strain'
                                      )
                                      .map(d => d.content)
                                      .reduce((acc, cv) => acc + cv, '') !== ''
                                  }
                                  sx={{ p: 0.5 }}
                                  onChange={e =>
                                    handleCardiacChange(e, {
                                      cname: 'Longitudial Strain',
                                      valueId: 0,
                                    })
                                  }
                                />
                              }
                              label='Longitudial Strain'
                              sx={{
                                m: 0,
                              }}
                            />
                            <div ref={longitudialStrainRef}>
                              {dataCardiacForm
                                .filter(
                                  data => data.name === 'Longitudial Strain'
                                )
                                .map((form, i) => {
                                  return (
                                    <div
                                      style={{ ...flexCenter, marginLeft: 28 }}
                                      key={i}
                                    >
                                      {CardiacInputText(form)}
                                    </div>
                                  )
                                })}
                            </div>

                            <FormControlLabel
                              control={
                                <Checkbox
                                  name='Circumferential Strain'
                                  defaultChecked={
                                    dataCardiacForm
                                      .filter(
                                        d => d.name === 'Circumferential Strain'
                                      )
                                      .map(d => d.content)
                                      .reduce((acc, cv) => acc + cv, '') !== ''
                                  }
                                  sx={{ p: 0.5 }}
                                  onChange={e =>
                                    handleCardiacChange(e, {
                                      valueId: shortAxisValueId,
                                      cname: 'Circumferential Strain',
                                    })
                                  }
                                />
                              }
                              label='Circumferential Strain'
                              sx={{
                                m: 0,
                                width: 250,
                              }}
                            />
                            <div ref={circumferentialStrainRef}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name='Short Axis'
                                    defaultChecked={shortAxisContent[0] !== ''}
                                    sx={{ p: 0.5 }}
                                    onChange={e =>
                                      handleCardiacChange(e, {
                                        cname: 'Short Axis',
                                        valueId: shortAxisValueId,
                                      })
                                    }
                                  />
                                }
                                label='Short Axis'
                                sx={{
                                  m: 0,
                                  width: 250,
                                  ml: 3.5,
                                }}
                              />
                              <div
                                ref={shortAxisRef}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  marginLeft: 55,
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      name={shortAxisValueId + '1'}
                                      defaultChecked={shortAxisContent.includes(
                                        'Apical'
                                      )}
                                      sx={{ p: 0.5 }}
                                      inputProps={{
                                        'data-value': 'Apical',
                                        'data-name': 'Short Axis',
                                      }}
                                      onChange={e =>
                                        handleCardiacChange(e, {
                                          cname: 'Apical',
                                          valueId: shortAxisValueId,
                                        })
                                      }
                                    />
                                  }
                                  label='Apical'
                                  sx={{
                                    m: 0,
                                    width: 200,
                                  }}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      name={shortAxisValueId + '2'}
                                      defaultChecked={shortAxisContent.includes(
                                        'Mid'
                                      )}
                                      sx={{ p: 0.5 }}
                                      inputProps={{
                                        'data-value': 'Mid',
                                        'data-name': 'Short Axis',
                                      }}
                                      onChange={e =>
                                        handleCardiacChange(e, {
                                          cname: 'Mid',
                                          valueId: shortAxisValueId,
                                        })
                                      }
                                    />
                                  }
                                  label='Mid'
                                  sx={{
                                    m: 0,
                                    width: 200,
                                  }}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      name={shortAxisValueId + '3'}
                                      defaultChecked={shortAxisContent.includes(
                                        'Basal'
                                      )}
                                      sx={{ p: 0.5 }}
                                      inputProps={{
                                        'data-value': 'Basal',
                                        'data-name': 'Short Axis',
                                      }}
                                      onChange={e =>
                                        handleCardiacChange(e, {
                                          cname: 'Basal',
                                          valueId: shortAxisValueId,
                                        })
                                      }
                                    />
                                  }
                                  label='Basal'
                                  sx={{
                                    m: 0,
                                    width: 200,
                                    mb: 1,
                                  }}
                                />
                              </div>

                              {dataCardiacForm
                                .filter(
                                  data =>
                                    data.name === 'Circumferential Strain' &&
                                    data.display !== 'Short Axis'
                                )
                                .map((form, i) => {
                                  return (
                                    <div
                                      style={{ ...flexCenter, marginLeft: 28 }}
                                      key={i}
                                    >
                                      {CardiacInputText(form)}
                                    </div>
                                  )
                                })}
                            </div>
                          </form>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
                width: 750,
                marginTop: 1,
                // marginLeft: 10,
              }}
            >
              {data && dataForm?.length > 0 && (
                <>
                  {dataForm?.slice(-5).map((form, i) => {
                    let value = ''
                    if (form.options?.length > 0) {
                      form.options.forEach(op => {
                        const test = data.find(
                          data => data.contentOption === op.opId
                        )
                        if (test) value = test.contentOption
                      })

                      return (
                        <div key={i}>
                          <Box sx={{ m: inputMargin }}>
                            <SelectField
                              value={value}
                              handleChange={e => handleChange(e, form)}
                              form={form}
                              minWidth={675}
                              controlled={false}
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
                          {form.type === 'A' || form.name === 'Comments' ? (
                            <Box sx={{ m: inputMargin }}>
                              <CommentField
                                minWidth={675}
                                form={form}
                                value={value}
                                handleChange={e => handleChange(e, form)}
                              />
                            </Box>
                          ) : (
                            <Box sx={{ m: inputMargin }}>
                              {i === 0 && <Divider sx={{ mt: 1, mb: 3 }} />}
                              <InputTextField
                                form={form}
                                value={value}
                                handleChange={e => handleChange(e, form)}
                                width={675}
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
                sx={{ ...btStyle, m: 1.3 }}
                variant='contained'
                startIcon={<CheckIcon />}
                onClick={() => saveData()}
              >
                Save
              </Button>
            </div>
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
      </div>
    </>
  )
}

export default FetalEcho
