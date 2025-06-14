import { useRef } from 'react'
import axios from 'axios'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

import {
  btStyle,
  inputStyle,
  dialogContentBgColor,
} from '../../../../../components/page-tools/form-style'
import { API } from '../../../../../config'
import { cleanUpForm } from '../../../helper'
import DialogTitle from '../components/BoxTitle'
import NotVisibleForm from '../components/NotVisibleForm'
import ModifiedContent from '../components/ModifiedContent'

let dialogWidth = 580

function Details({ dialog, setOpen, setSnackWarning }) {
  const modifiedContentRef = useRef(null)
  // if (dialog?.form) console.log(dialog.form)

  async function handleSave() {
    let newForm = { ...dialog.formSend }

    // if (modifiedContentRef.current.value) {
    let modifyId = dialog.form[6].valueId
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
    // }

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[7].valueId
      newForm = {
        ...newForm,
        [reasonId]: { type: 'T', value: dialog.formSend[reasonId].value },
      }
    }

    newForm = cleanUpForm(newForm)

    // console.log(newForm)

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

  async function handleChange(e, form) {
    // console.log(form)
    let value = e.target.value

    if (form.type === 'C') {
      value = ''
      if (e.target.checked) value = form.name
    }

    dialog.formSend = {
      ...dialog.formSend,
      [form.valueId]: { type: form.type, value },
    }

    let content1 = []
    let content2 = []
    // console.log(dialog.formSend)
    content1 = Object.keys(dialog.formSend)
      .filter(
        key =>
          ['C', 'S'].includes(dialog.formSend[key].type) &&
          dialog.formSend[key].value
      )
      .map(key => dialog.formSend[key].value)

    if (form.type !== 'S')
      content2 = Object.keys(dialog.formSend)
        .filter(
          key =>
            !['A', 'C'].includes(dialog.formSend[key].type) &&
            dialog.formSend[key].value
        )
        .map(
          key =>
            `${dialog.form.find(f => f.valueId == key).name}: ${
              dialog.formSend[key].value
            }`
        )

    let modifyContent = content1.join(', ') + `\n` + content2.join(`\n`)
    modifiedContentRef.current.value = modifyContent.trim()
  }

  function handleClose() {
    setOpen({})
  }

  return (
    <>
      {dialog?.form && (
        <Dialog open={dialog.open} onClose={handleClose} maxWidth={'md'}>
          <DialogTitle
            titleName='Cord'
            type={dialog.type}
            handleClose={handleClose}
          />
          <DialogContent
            sx={{
              ...dialogContentBgColor,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              width: dialogWidth,
            }}
          >
            <form autoComplete='off'>
              {['Abnormal', 'Details'].includes(dialog.type) ? (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='singleArtery'
                        defaultChecked={dialog.form[0].content !== ''}
                        sx={{ p: 0.5 }}
                        onChange={e => handleChange(e, dialog.form[0])}
                      />
                    }
                    label='Single artery'
                    sx={{ m: 0, mr: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='knots'
                        defaultChecked={dialog.form[3].content !== ''}
                        onChange={e => handleChange(e, dialog.form[3])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Knots'
                    sx={{ m: 0, mr: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='roundTheNeck'
                        defaultChecked={dialog.form[4].content !== ''}
                        onChange={e => handleChange(e, dialog.form[4])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    sx={{ m: 0, mr: 2 }}
                    label='Round the neck'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='chorioangioma'
                        defaultChecked={dialog.form[5].content !== ''}
                        onChange={e => handleChange(e, dialog.form[5])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Chorioangioma'
                    sx={{ m: 0 }}
                  />
                  <TextField
                    label='Insertion'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    name='insertion'
                    defaultValue={dialog.form[1].content}
                    onChange={e => handleChange(e, dialog.form[1])}
                    sx={{ ...inputStyle, width: '48%', mt: 2, mr: 1 }}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        mt: -0.3,
                        fontSize: 20,
                      },
                    }}
                  />
                  <TextField
                    label='Cord cysts'
                    variant='outlined'
                    size='small'
                    margin='dense'
                    name='cordCysts'
                    defaultValue={dialog.form[2].content}
                    onChange={e => handleChange(e, dialog.form[2])}
                    sx={{ ...inputStyle, width: '48%', mt: 2 }}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        mt: -0.3,
                        fontSize: 20,
                      },
                    }}
                  />
                </>
              ) : (
                <NotVisibleForm
                  dataForm={dialog.form[7]}
                  handleChange={handleChange}
                  width={dialogWidth - 28}
                />
              )}
              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[6]}
                width={dialogWidth - 28}
              />

              <Button
                sx={{ ...btStyle, mt: 2, float: 'right', mr: 1.1, mb: 1 }}
                variant='contained'
                startIcon={<CheckIcon />}
                onClick={() => handleSave()}
              >
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default Details
