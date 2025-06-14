import { useRef, useEffect } from 'react'
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
import DialogActions from '@mui/material/DialogActions'

import {
  inputStyle,
  btStyle,
  dialogContentBgColor,
} from '../../../../../components/page-tools/form-style'
import { API, MODE } from '../../../../../config'
import { cleanUpForm } from '../../../helper'
import DialogTitle from '../components/BoxTitle'
import NotVisibleForm from '../components/NotVisibleForm2'
import ModifiedContent from '../components/ModifiedContent'
import { qsa } from '../../../../../utils/domUtils'
import { capitalizeSentence, formDataToObject2 } from '../../../../../utils'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = ['Male', 'Female', 'Not Known']
const option2 = ['Mild', 'Moderate', 'Severe']

const modifiedContent = {
  419: [419],
  420: [420],
  421: [421],
  422: [422],
}

function Details({ dialog, setOpen, setSnackWarning }) {
  const SelectOption = (form, options = [], width = 150) => {
    let val = form.content.split('-')
    let valueId = form.valueId + ''

    if (val.length > 1) {
      val = capitalizeSentence(val[1])
    } else if (val.length === 1) val = val[0]
    else val = ''

    if ([420].includes(form.valueId)) valueId = `${form.valueId}-option-1`

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

  const dialogWidth = 500
  const modifiedContentRef = useRef(null)
  const notVisibleRef = useRef(null)
  const formRef = useRef(null)

  const section1 = useRef(null)

  const secRefObj = { 420: section1 }

  const secRefId = [420]

  useEffect(() => {
    if (dialog?.form) {
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
      if ([420].includes(form.valueId)) {
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

        Object.keys(modifiedContent).forEach(key => {
          if (newForm[key]?.value) {
            let content = `${newForm[key].name}: ${newForm[key].value}`

            if (['421', '422'].includes(key)) {
              content = newForm[key].name
            }

            if (key === '420') {
              let value = newForm[key].value.split('-')
              content = `${value[0]}: ${value.length > 1 ? value[1] : ''}`
            }

            contentArr.push(content)
          }
        })

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[5].valueId
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

    let modifyId = dialog.form[4].valueId
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
          maxWidth={'md'}
          scroll='body'
        >
          <DialogTitle
            titleName='Genitalia'
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
                    <div style={{ width: 150 }}>Sex </div>
                    {SelectOption(dialog.form[0], option1)}
                  </div>
                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[1], 160)}
                    <div
                      ref={section1}
                      style={{ marginTop: -3, display: 'none' }}
                    >
                      {SelectOption(dialog.form[1], option2)}
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[2], 160)}
                  </div>
                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[3], 160)}
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[5].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[5])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[4]}
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
