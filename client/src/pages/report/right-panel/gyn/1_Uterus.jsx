import { useEffect, useState } from 'react'

import axios from 'axios'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
// import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import Typography from '@mui/material/Typography'
// import useTheme from '@mui/material/styles/useTheme'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import InfoIcon from '@mui/icons-material/Info'

import { API, TEMPLATES, REPORT_ID, MODE } from '../../../../config'
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
import { sleep } from '../../../../utils'
import CommentField from '../../../../components/page-tools/CommentField'
import SelectField from '../../../../components/page-tools/SelectField'
import InputTextField from '../../../../components/page-tools/InputTextField'
// import AutoCompleteField from '../../../../components/page-tools/AutoCompleteField'
import { initFormSend, storeBackupData } from '../../report-utils'
import './style.css'
import Fibroids from './Fibroids'
import SkeletonLoading from '../../../../components/page-tools/SkeletonLoading'

const templateId = TEMPLATES.uterus.id
let backupData = null
const defaultAbnormal = { myometrium: false, cervix: false }

const Uterus = ({ patient }) => {
  // const theme = useTheme()
  const [data, setData] = useState(null)
  const [dataForm, setDataForm] = useState([])
  const [dataFormSend, setDataFormSend] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFreetext, setShowFreetext] = useState(false)
  const [showAbnormal, setShowAbnormal] = useState(defaultAbnormal)
  const [openFibroids, setOpenFibroids] = useState(false)

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
    setShowFreetext(false)
    setShowAbnormal(defaultAbnormal)
  }

  function initData() {
    try {
      setLoading(true)
      const rand = randomMs()
      sleep(rand).then(async () => {
        if (!REPORT_ID[TEMPLATES.uterus.name][patient.currentFetus]) {
          // console.log('******getReportId()', rand)
          const id = await getReportId(
            patient.accession,
            patient.currentFetus,
            templateId
          )
          // console.log('id', id)
          REPORT_ID[TEMPLATES.uterus.name][patient.currentFetus] = id
        }
        // console.log(REPORT_ID)
        fetchData()
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchData() {
    try {
      const res = await axios.get(API.REPORT_CONTENT, {
        params: {
          reportId: getRiD(TEMPLATES.uterus.name, patient.currentFetus),
        },
      })
      // console.log(res.data.data)
      setData(res.data.data)

      getReportForm(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function getReportForm(data) {
    const [formSend, form] = await initFormSend(
      data,
      getRiD(TEMPLATES.uterus.name, patient.currentFetus),
      templateId
    )

    const hasUterusFreetext =
      data.find(d => d.contentValueName === 'Freetext')?.content || ''
    if (hasUterusFreetext) setShowFreetext(true)

    let ab = { ...defaultAbnormal }
    const hasMyometriumAbnormal =
      data.find(
        d =>
          d.contentValueName === 'Myometrium' &&
          d.contentOptionDisplay === 'Abnormal'
      ) || ''

    if (hasMyometriumAbnormal) ab = { ...ab, myometrium: true }

    const hasCervixAbnormal =
      data.find(
        d =>
          d.contentValueName === 'Cervix' &&
          d.contentOptionDisplay === 'Abnormal'
      ) || ''
    if (hasCervixAbnormal) ab = { ...ab, cervix: true }

    setShowAbnormal(ab)
    // console.log(formSend)
    setDataFormSend(formSend)
    backupData = formSend
    storeBackupData(formSend)

    setDataForm(form)
    setLoading(false)
  }

  function handleChange(e, d) {
    // console.log('handleChange', d)
    updateDataChange('1')
    let v =
      d.type === 'A'
        ? replaceNewLineWithBr(e.target.value)
        : ['S', 'T'].includes(d.type)
        ? e.target.value
        : e.target.checked
        ? d.name
        : ''

    if (d.valueId === 492) {
      // console.log(d.options)
      // console.log(d.valueId)
      // console.log(dataFormSend)
      let b = false
      if (e.target.value > 435) {
        b = true
      } else {
        // delete freetext if not select other
        setData(prev => prev.filter(p => p.contentValueName !== 'Freetext'))
        let t = { ...dataFormSend }
        Object.keys(t).forEach(key => {
          if (t[key].type === 'T') {
            t[key].value = ''
          }
        })
        // console.log(t)
        setDataFormSend(t)
      }
      setShowFreetext(b)
    }

    if (d.valueId === 494) {
      let b = false
      if (e.target.value === 443) {
        b = true
      }
      setShowAbnormal(prev => ({ ...prev, myometrium: b }))
    }

    if (d.valueId === 498) {
      let b = false
      if (e.target.value === 445) b = true
      setShowAbnormal(prev => ({ ...prev, cervix: b }))
    }

    if (d.valueId === 495) {
      v = ''
      if (e.target.checked) v = 'Thickening'
    }

    if (d.valueId === 496) {
      v = ''
      if (e.target.checked) {
        v = 'Myoma'
        setOpenFibroids(true)
      }
    }

    if (d.valueId === 497) {
      v = ''
      if (e.target.checked) v = 'Adenomyosis'
    }

    setDataFormSend(prev => {
      let temp = {
        ...prev,
        [d.valueId]: {
          ...prev[d.valueId],
          value: v,
        },
      }

      if (d.valueId === 494 && e.target.value !== 443) {
        //clear Myometrium Abnormal 495 496 497
        Object.keys(temp).forEach(key => {
          if (['495', '496', '497'].includes(key)) {
            temp[key].value = ''
          }
        })

        setData(prev =>
          prev.filter(p => ![495, 496, 497].includes(p.refValueId))
        )
      }

      if (d.valueId === 498 && e.target.value !== 445) {
        //clear Cervix Abnormal 499
        temp['499'].value = ''
        setData(prev => prev.filter(p => p.refValueId !== 499))
      }

      // console.log(temp)
      backupData = temp
      storeBackupData(temp)
      return temp
    })
  }

  function handleCustomInputChange(e, refValueId) {
    updateDataChange('1')
    // console.log(e.target.value)
    // console.log(refValueId)
    // console.log(dataFormSend)
    let optionVal =
      !e.target.value || e.target.value.trim() === ''
        ? '-'
        : '-' + e.target.value

    setDataFormSend(prev => {
      const temp = {
        ...prev,
        [refValueId]: {
          ...prev[refValueId],
          value: prev[refValueId].value.split('-')[0] + optionVal,
        },
      }

      // console.log(temp)
      backupData = temp
      storeBackupData(temp)
      return temp
    })
  }

  async function saveData() {
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
  }

  return (
    <>
      {/* {loading && <LinearProgress sx={{ mt: 0.5 }} />} */}
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
            dataForm
              .filter(form => form.valueId >= 492 && form.valueId <= 499)
              .map((form, i) => {
                if (form.type === 'S') {
                  let value = ''
                  form.options.forEach(op => {
                    const test = data.find(
                      data => data.contentOption === op.opId
                    )
                    if (test) value = test.contentOption
                  })

                  if (form.valueId === 492) {
                    let temp = [...form.options]
                    let onlyOther = temp.filter(t => t.name === 'Other')
                    let withOutOther = temp.filter(t => t.name !== 'Other')
                    form.options = [...onlyOther, ...withOutOther]
                  }

                  return (
                    <div key={i} style={{ width: form.valueId === 494 && 650 }}>
                      <Box sx={{ m: inputMargin }}>
                        <SelectField
                          value={value}
                          handleChange={e => handleChange(e, form)}
                          form={form}
                        />
                      </Box>
                      {showFreetext && form.valueId === 492 && (
                        <Box sx={{ m: inputMargin, mt: 2 }}>
                          <InputTextField
                            value={
                              data.find(
                                data => data.contentValueName === 'Freetext'
                              )?.content || ''
                            }
                            handleChange={e =>
                              handleChange(
                                e,
                                dataForm.find(f => f.name === 'Freetext') ||
                                  null
                              )
                            }
                            form={
                              dataForm.find(f => f.name === 'Freetext') || null
                            }
                            label='Uterus Freetext'
                          />
                        </Box>
                      )}
                      {showAbnormal.myometrium && form.valueId === 494 && (
                        <Box sx={{ m: inputMargin }}>
                          <fieldset
                            className='abnormal'
                            style={
                              {
                                // backgroundColor:
                                //   theme.palette.mode === 'light'
                                //     ? 'white'
                                //     : '#393939',
                              }
                            }
                          >
                            <legend
                              style={{
                                paddingLeft: 5,
                                fontWeight: 'bold',
                                fontSize: 16,
                              }}
                            >
                              Myometrium Abnormal
                            </legend>
                            <Box
                              sx={{
                                pl: 1.6,
                                color: theme =>
                                  MODE[theme.palette.mode].dataGrid.font,
                              }}
                            >
                              <FormGroup
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <div>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        defaultChecked={
                                          data
                                            .find(
                                              data => data.refValueId === 495
                                            )
                                            ?.content.split('-')[0] ===
                                          'Thickening'
                                            ? true
                                            : false
                                        }
                                        onChange={e =>
                                          handleChange(
                                            e,
                                            dataForm.find(
                                              f => f.valueId === 495
                                            ) || null
                                          )
                                        }
                                      />
                                    }
                                    label='Thickening'
                                    sx={{ width: 150 }}
                                  />
                                  <FormControl
                                    size='small'
                                    sx={{
                                      ...inputStyle,
                                      m: 0,
                                      minWidth: 300,
                                    }}
                                  >
                                    <Select
                                      size='small'
                                      variant='outlined'
                                      notched
                                      sx={{
                                        fontSize: 16,
                                        pb: 0,
                                        color: theme =>
                                          MODE[theme.palette.mode].dataGrid
                                            .font,
                                      }}
                                      defaultValue={
                                        data
                                          .find(d => d.refValueId === 495)
                                          ?.content?.split('-')[1] || ''
                                      }
                                      onChange={e =>
                                        handleCustomInputChange(e, 495)
                                      }
                                    >
                                      <MenuItem value=''></MenuItem>
                                      <MenuItem value='Anterior wall'>
                                        Anterior wall
                                      </MenuItem>
                                      <MenuItem value='Posterior wall'>
                                        Posterior wall
                                      </MenuItem>
                                      <MenuItem value='Both wall'>
                                        Both wall
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        defaultChecked={
                                          data.find(
                                            data => data.refValueId === 496
                                          )?.content === 'Myoma'
                                            ? true
                                            : false
                                        }
                                        onChange={e =>
                                          handleChange(
                                            e,
                                            dataForm.find(
                                              f => f.valueId === 496
                                            ) || null
                                          )
                                        }
                                      />
                                    }
                                    label='Myoma'
                                    // sx={{ width: 150 }}
                                  />
                                  {data.find(data => data.refValueId === 496)
                                    ?.content === 'Myoma' && (
                                    <InfoIcon
                                      color='info'
                                      titleAccess='Fibroids'
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() => setOpenFibroids(true)}
                                    />
                                  )}
                                </div>
                                <div>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        defaultChecked={
                                          data
                                            .find(
                                              data => data.refValueId === 497
                                            )
                                            ?.content.split('-')[0] ===
                                          'Adenomyosis'
                                            ? true
                                            : false
                                        }
                                        onChange={e =>
                                          handleChange(
                                            e,
                                            dataForm.find(
                                              f => f.valueId === 497
                                            ) || null
                                          )
                                        }
                                      />
                                    }
                                    label='Adenomyosis'
                                    sx={{ width: 150 }}
                                  />
                                  <TextField
                                    size='small'
                                    variant='outlined'
                                    inputProps={{
                                      style: {
                                        fontSize: 16,
                                      },
                                    }}
                                    sx={{
                                      ...inputStyle,
                                      ml: 0,
                                      // width,
                                      backgroundColor: theme =>
                                        theme.palette.mode === 'light'
                                          ? 'white'
                                          : '#393939',
                                    }}
                                    defaultValue={
                                      data
                                        .find(d => d.refValueId === 497)
                                        ?.content?.split('-')[1] || ''
                                    }
                                    onChange={e =>
                                      handleCustomInputChange(e, 497)
                                    }
                                  />
                                </div>
                              </FormGroup>
                            </Box>
                          </fieldset>
                        </Box>
                      )}
                    </div>
                  )
                } else if (form.type === 'A') {
                  let value = ''

                  const test = data.find(
                    data => data.refValueId === form.valueId
                  )
                  if (test && test.content) value = test.content

                  return (
                    <Box key={i} sx={{ m: inputMargin }}>
                      {showAbnormal.cervix && (
                        <CommentField
                          minWidth={673}
                          form={form}
                          value={value}
                          handleChange={e => handleChange(e, form)}
                          isRedStyle={true}
                        />
                      )}
                    </Box>
                  )
                }
              })}
          <Typography variant='h5' sx={{ width: 600, mt: 1 }}>
            Endometrium
          </Typography>
          {dataForm.length > 0 &&
            dataForm
              .filter(form => form.valueId >= 500 && form.valueId <= 503)
              .map((form, i) => {
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
                        minWidth={673}
                      />
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

      {openFibroids && (
        <Fibroids
          patient={patient}
          open={openFibroids}
          setOpen={setOpenFibroids}
          callback={async () => {
            await autoSave(backupData)
            resetData()
            fetchData()
            // updateDataChange('0')
          }}
        />
      )}

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </>
  )
}

export default Uterus
