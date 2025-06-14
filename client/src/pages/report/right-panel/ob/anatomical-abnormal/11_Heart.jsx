import { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Box, DialogActions, Typography } from '@mui/material'

import {
  inputStyle,
  btStyle,
  dialogContentBgColor,
} from '../../../../../components/page-tools/form-style'
import { API, MODE } from '../../../../../config'
import { cleanUpForm, numFormatDigit } from '../../../helper'
import DialogTitle from '../components/BoxTitle'
import NotVisibleForm from '../components/NotVisibleForm2'
import ModifiedContent from '../components/ModifiedContent'
import { qsa } from '../../../../../utils/domUtils'
import { capitalizeSentence, formDataToObject2 } from '../../../../../utils'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = ['Normal', 'Abnormal', 'Not Examined', 'Not Visible']
const option2 = [
  'Ratio < 0.47 (below mean value of control group, AVSD unlikely)',
  'Ratio < 0.58 (no AVSD in study group)',
  'Ratio >= 0.58 (AVSD Detection 100%, false pos. 7.3%)',
  'Ratio >= 0.60 (AVSD Detection 86.2%, false pos. 5.7%)',
]
const option3 = ['Mild', 'Moderate', 'Severe']
const option4 = [
  'Single Left Sided',
  'Single Right Sided',
  'Septal',
  'Multiple',
]

const modifiedContent = {
  273: [273],
  274: [274],
  275: [275],
  276: [276],
  277: [277],
  278: [278],
  'Cardiac Biometry': [279, 291],
  'Other Findings': [292, 304],
}

function Details({ dialog, setOpen, setSnackWarning }) {
  const InputText = (form, width = 60) => {
    let inputRef = undefined
    let readOnly = [277, 278].includes(form.valueId)
    let textAlign = { textAlign: 'right' }
    if (form.valueId === 277) {
      inputRef = avlRatioRef
    }

    if (form.valueId === 278) {
      inputRef = evaluationRef
      textAlign = {}
    }
    return (
      <>
        <TextField
          inputRef={inputRef}
          name={form.valueId + ''}
          size='small'
          variant='outlined'
          InputProps={{
            readOnly,
          }}
          inputProps={{
            'data-name': form.name,
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
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={form.content || ''}
          onChange={e => handleChange(e, form)}
        />
        &nbsp; {form.unit || ''}
      </>
    )
  }
  const SelectOption = (form, options = [], width = 150) => {
    let val = form.content.split('-')
    let valueId = form.valueId + ''

    if (val.length > 1) {
      val = capitalizeSentence(val[1])
    } else if (val.length === 1) val = val[0]
    else val = ''

    if ([294, 298, 304].includes(form.valueId))
      valueId = `${form.valueId}-option-1`

    return (
      <FormControl size='small' sx={{ ...inputStyle, width, height: 35 }}>
        <Select
          size='small'
          variant='outlined'
          notched
          name={valueId}
          sx={{
            fontSize: 16,
            p: 0,
            height: 35,
            color: theme => MODE[theme.palette.mode].dataGrid.font,
          }}
          inputProps={{
            'data-name': form.name,
          }}
          onChange={handleChange}
          defaultValue={!options.includes(val) ? '' : val || ''}
        >
          <MenuItem value=''></MenuItem>
          {options.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
  const CheckBox = (form, width = 190) => {
    let { valueId, name, content } = form
    let label = name

    return (
      <FormControlLabel
        control={
          <Checkbox
            name={valueId + ''}
            defaultChecked={content !== ''}
            sx={{ p: 0.5 }}
            inputProps={{ 'data-value': label, 'data-name': name }}
            //   onChange={handleChange ? e => handleChange(e,form) : undefined}
            onChange={e => handleChange(e, form)}
          />
        }
        label={label}
        sx={{
          m: 0,
          width,
        }}
      />
    )
  }

  const [dialogWidth, setDialogWidth] = useState(1200)
  const modifiedContentRef = useRef(null)
  const notVisibleRef = useRef(null)
  const formRef = useRef(null)
  const avlRatioRef = useRef(null)
  const evaluationRef = useRef(null)

  const section1 = useRef(null)
  const section2 = useRef(null)
  const section3 = useRef(null)

  const secRefObj = { 294: section1, 298: section2, 304: section3 }

  const secRefId = [294, 298, 304]

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 1200)
      //   console.log(dialog.form)

      setTimeout(() => {
        dialog.form.forEach(form => {
          if (secRefId.includes(form.valueId)) {
            if (form.content)
              if (secRefObj[form.valueId])
                secRefObj[form.valueId].current.style.display = 'block'
          }
        })
      }, 50)
    }

    return () => {}

    // eslint-disable-next-line
  }, [dialog])

  function handleChange(e, form) {
    const { value, checked, type } = e.target

    if (form && type === 'checkbox') {
      if ([294, 298, 304].includes(form.valueId)) {
        secRefObj[form.valueId].current.style.display = checked
          ? 'block'
          : 'none'
      }
    }

    if (form && form.name === 'Reason') {
      modifiedContentRef.current.value = value || ''
    } else {
      setTimeout(() => {
        let contentArr = []

        const data = qsa(['input', 'select', 'checkbox'], formRef.current)
        let newForm = formDataToObject2(data)

        if ([275, 276].includes(form.valueId)) {
          newForm['277'].value = ''
          newForm['278'].value = ''
          avlRatioRef.current.value = ''
          evaluationRef.current.value = ''
          let n1 = parseFloat(newForm[275].value) || 0
          let n2 = parseFloat(newForm[276].value) || 0
          let n3 = 0
          if (n1 > 0 && n2 > 0) {
            n3 = numFormatDigit(n1 / n2)
          }

          if (n3) {
            newForm['277'].value = n3
            avlRatioRef.current.value = n3
            let check = parseFloat(n3)
            let value = ''

            if (check < 0.47) {
              value = option2[0]
            } else if (check >= 0.47 && check < 0.58) {
              value = option2[1]
            } else if (check >= 0.58 && check < 0.6) {
              value = option2[2]
            } else if (check >= 0.6) {
              value = option2[3]
            }

            evaluationRef.current.value = value
            newForm['278'].value = value
          }
        }

        Object.keys(modifiedContent).forEach(key => {
          if (modifiedContent[key].length === 1) {
            if (newForm[key]?.value) {
              contentArr.push(
                `${newForm[key].name}: ${newForm[key].value}${
                  newForm[key].unit || ''
                }`
              )
            }
          } else {
            let start = modifiedContent[key][0]
            let end = modifiedContent[key][1]
            let arr = []
            if (key === 'Cardiac Biometry') {
              let cardiacKey = Object.keys(newForm).filter(
                key =>
                  parseInt(key.split('-')[0]) >= start &&
                  parseInt(key.split('-')[0]) <= end
              )

              cardiacKey.forEach(key => {
                if (newForm[key]?.value)
                  arr.push(
                    `${newForm[key].name} ${newForm[key].value}${
                      newForm[key].unit || ''
                    }`
                  )
              })
              if (arr.length > 0) contentArr.push(`${key}: ${arr.join(', ')}`)
            } else if (key === 'Other Findings') {
              let otherFindingsKey = Object.keys(newForm).filter(
                key =>
                  parseInt(key.split('-')[0]) >= start &&
                  parseInt(key.split('-')[0]) <= end &&
                  key.indexOf('-option') === -1
              )

              otherFindingsKey.forEach(key => {
                if (newForm[key]?.value) {
                  let val = newForm[key].value
                  if (['294', '298', '304'].includes(key)) {
                    let temp = newForm[key].value?.split('-')
                    val = `${temp[0]}${temp.length > 1 ? `(${temp[1]})` : ''}`
                  }
                  arr.push(val)
                }
              })
              if (arr.length > 0) contentArr.push(`${key}: ${arr.join(', ')}`)
            }
          }
        })

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[33].valueId
      newForm = {
        [reasonId]: {
          type: 'T',
          value: notVisibleRef.current.value.replace(/(\r\n|\r|\n)/g, '<br />'),
        },
      }
    } else {
      const data = qsa(['input', 'select', 'checkbox'], formRef.current)
      newForm = formDataToObject2(data)
      //   console.log(newForm)

      Object.keys(newForm)
        .filter(key => key.indexOf(`-option`) > -1)
        .forEach(key => {
          delete newForm[key]
        })
    }

    let modifyId = dialog.form[32].valueId
    newForm = {
      ...newForm,
      [modifyId]: {
        type: 'T',
        value: modifiedContentRef.current.value.replace(
          /(\r\n|\r|\n)/g,
          '<br />'
        ),
      },
    }

    newForm['reportId'] = dialog.formSend.reportId
    newForm = cleanUpForm(newForm)

    const res = await axios.post(API.REPORT_CONTENT, { reportData: newForm })

    let message = 'Save Fail!'
    let severity = 'error'

    if (res.data.data) {
      message = 'Save Completed'
      severity = 'success'
    }
    handleClose()
    setSnackWarning(prev => ({ ...prev, show: true, message, severity }))
  }

  function handleClose() {
    setOpen({})
  }

  return (
    <>
      {dialog?.form && (
        <Dialog
          open={dialog.open}
          onClose={handleClose}
          maxWidth={'lg'}
          scroll='body'
        >
          <DialogTitle
            titleName='Heart'
            type={dialog.type}
            handleClose={handleClose}
          />
          <DialogContent
            sx={{
              ...dialogContentBgColor,
              ...flexCenter,
              p: 1,
              width: dialogWidth,
            }}
          >
            <form autoComplete='off' ref={formRef}>
              {['Abnormal', 'Details'].includes(dialog.type) ? (
                <>
                  <div style={{ ...flexCenter, marginLeft: 10 }}>
                    <div style={{ width: 150 }}>4 Chamber View </div>
                    {SelectOption(dialog.form[0], option1)}
                  </div>
                  <div style={{ ...flexCenter, marginLeft: 10, marginTop: 9 }}>
                    <div style={{ width: 150 }}>Vessels </div>
                    {SelectOption(dialog.form[1], option1)}
                  </div>
                  <Box
                    sx={{
                      display: 'flex',
                      columnGap: 2,
                      mt: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: '60%',
                        height: 560,
                        pl: 2.5,
                        borderRadius: 1,
                        border: theme =>
                          theme.palette.mode === 'dark'
                            ? `1px solid #CCC`
                            : '1px solid #CCC',
                      }}
                    >
                      <Typography
                        variant='h6'
                        sx={{ m: 0, ml: -1, mt: 1, mb: 1 }}
                      >
                        AVL-Ratio
                      </Typography>
                      <div style={{ ...flexCenter }}>
                        <div style={{ width: 140 }}>Heart Length </div>
                        {InputText(dialog.form[2])}
                      </div>
                      <div style={{ ...flexCenter, marginTop: 9 }}>
                        <div style={{ width: 140 }}>Ventricle Length </div>
                        {InputText(dialog.form[3])}
                      </div>
                      <div style={{ ...flexCenter, marginTop: 9 }}>
                        <div style={{ width: 140 }}>AVL-Ratio </div>
                        {InputText(dialog.form[4])}
                      </div>
                      <div style={{ ...flexCenter, marginTop: 9 }}>
                        <div style={{ width: 140 }}>Evaluation </div>
                        {/* {SelectOption(dialog.form[5], option2, 505)} */}
                        {InputText(dialog.form[5], 505)}
                      </div>

                      <Typography
                        variant='h6'
                        sx={{ m: 0, ml: -1, mt: 2, mb: 1 }}
                      >
                        Cardiac Biometry
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          columnGap: 9,
                          mt: 1.5,
                        }}
                      >
                        <Box>
                          {dialog.form
                            .filter(
                              form => form.valueId >= 279 && form.valueId <= 285
                            )
                            .map((form, index) => {
                              let margin = { marginTop: 9 }
                              if (index === 0) margin = {}
                              return (
                                <div
                                  key={index}
                                  style={{ ...flexCenter, ...margin }}
                                >
                                  <div style={{ width: 180 }}>{form.name}</div>
                                  {InputText(form)}
                                </div>
                              )
                            })}
                        </Box>
                        <Box>
                          {dialog.form
                            .filter(
                              form => form.valueId >= 286 && form.valueId <= 291
                            )
                            .map((form, index) => {
                              let margin = { marginTop: 9 }
                              if (index === 0) margin = {}
                              return (
                                <div
                                  key={index}
                                  style={{ ...flexCenter, ...margin }}
                                >
                                  <div style={{ width: 155 }}>{form.name}</div>
                                  {InputText(form)}
                                </div>
                              )
                            })}
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: '40%',
                        height: 590,
                        pl: 1.5,
                        borderRadius: 1,
                        border: theme =>
                          theme.palette.mode === 'dark'
                            ? `1px solid #CCC`
                            : '1px solid #CCC',
                      }}
                    >
                      <Typography variant='h6' sx={{ m: 0.5, mb: 1 }}>
                        Other Findings
                      </Typography>
                      <Box>
                        {dialog.form
                          .filter(
                            form => form.valueId >= 292 && form.valueId <= 304
                          )
                          .map((form, index) => {
                            let margin = { marginTop: 9 }
                            if (index === 0) margin = {}

                            let selectOption = null
                            let width = 270
                            let divRef = undefined
                            let displayStyle = {}
                            if ([294, 298, 304].includes(form.valueId)) {
                              width = 230
                              let option =
                                form.valueId === 304 ? option4 : option3
                              let optionWidth = form.valueId === 304 ? 180 : 120

                              divRef = secRefObj[form.valueId]
                              displayStyle = { display: 'none' }

                              selectOption = (
                                <div ref={secRefObj[form.valueId]}>
                                  {SelectOption(form, option, optionWidth)}
                                </div>
                              )
                            }
                            return (
                              <div
                                key={index}
                                style={{
                                  ...flexCenter,
                                  ...margin,
                                }}
                              >
                                {CheckBox(form, width)}
                                <div
                                  ref={divRef}
                                  style={{ ...displayStyle, marginTop: -3 }}
                                >
                                  {selectOption}
                                </div>
                              </div>
                            )
                          })}
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[33].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[33])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[32]}
                width={dialogWidth - 26}
                row={dialog.type !== 'Not Visible' ? 10 : 5}
              />
            </form>
          </DialogContent>
          <DialogActions sx={dialogContentBgColor}>
            <Button
              sx={{ ...btStyle, float: 'right', mr: 1.1 }}
              variant='contained'
              startIcon={<CheckIcon />}
              onClick={() => handleSave()}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default Details
