import { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogActions from '@mui/material/DialogActions'

import {
  btStyle,
  dialogContentBgColor,
} from '../../../../../components/page-tools/form-style'
import { API } from '../../../../../config'
import { cleanUpForm } from '../../../helper'
import DialogTitle from '../components/BoxTitle'
import NotVisibleForm from '../components/NotVisibleForm2'
import ModifiedContent from '../components/ModifiedContent'
import { qsa } from '../../../../../utils/domUtils'
import { formDataToObject2 } from '../../../../../utils'

const flexCenter = { display: 'flex', alignItems: 'center' }

const modifiedContent = {
  350: [351, 352, 353, 354, 355],
  356: [357, 358, 362, 361, 360, 359],
}

const lastCheckBox = [363, 364, 365]

function Details({ dialog, setOpen, setSnackWarning }) {
  const CheckBox = (form, width = 190) => {
    let { valueId, name, content } = form
    let label = name

    if (name.indexOf('-') > -1) label = name.split('-')[1]

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

  const [dialogWidth, setDialogWidth] = useState(800)
  const modifiedContentRef = useRef(null)
  const notVisibleRef = useRef(null)
  const formRef = useRef(null)

  const section1 = useRef(null)
  const section2 = useRef(null)

  const secRefObj = { 350: section1, 356: section2 }

  const secRefId = [350, 356]

  useEffect(() => {
    if (dialog?.form) {
      console.log(dialog.form)
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 800)
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
      if (secRefId.includes(form.valueId)) {
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
        // console.log(newForm)
        Object.keys(modifiedContent).forEach(key => {
          let arr = []
          if (newForm[key]?.value) {
            let value = newForm[key].value + ': '
            modifiedContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) arr.push(newForm[valueId].value)
            })

            contentArr.push(value + arr.join(', '))
          }
        })

        let lastArr = []
        Object.keys(newForm)
          .filter(key => lastCheckBox.includes(parseInt(key)))
          .forEach(key => {
            if (newForm[key]?.value) lastArr.push(newForm[key].value)
          })

        if (lastArr.length > 0) contentArr.push(lastArr.join(', '))

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[17].valueId
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

      Object.keys(modifiedContent).forEach(key => {
        if (!newForm[key]?.value) {
          modifiedContent[key].forEach(valueId => {
            delete newForm[valueId]
          })
        }
      })

      Object.keys(newForm)
        .filter(key => key.indexOf(`-option`) > -1)
        .forEach(key => {
          delete newForm[key]
        })
    }

    let modifyId = dialog.form[16].valueId
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
                  <div style={{ ...flexCenter }}>
                    {CheckBox(dialog.form[0], 190)}
                    <div ref={section1} style={{ display: 'none' }}>
                      <div>Herniated Viscera:</div>
                      <div>
                        {CheckBox(dialog.form[1], 90)}
                        {CheckBox(dialog.form[2], 80)}
                        {CheckBox(dialog.form[3], 110)}
                        {CheckBox(dialog.form[4], 120)}
                        {CheckBox(dialog.form[5], 80)}
                      </div>
                    </div>
                  </div>
                  <div style={{ ...flexCenter, marginTop: 15 }}>
                    {CheckBox(dialog.form[6], 190)}
                    <div ref={section2} style={{ display: 'none' }}>
                      <div>Contents:</div>
                      <div>
                        {CheckBox(dialog.form[7], 90)}
                        {CheckBox(dialog.form[8], 80)}
                        {CheckBox(dialog.form[12], 110)}
                        {CheckBox(dialog.form[11], 120)}
                        {CheckBox(dialog.form[10], 80)}
                        {CheckBox(dialog.form[9], 100)}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 15 }}>
                    {CheckBox(dialog.form[13], 190)}
                    {CheckBox(dialog.form[14])}
                    {CheckBox(dialog.form[15])}
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[17].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[17])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[16]}
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
