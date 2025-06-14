import { useRef } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import axios from 'axios'

import {
  btStyle,
  dialogContentBgColor,
} from '../../../../../components/page-tools/form-style'
import { API } from '../../../../../config'
import { cleanUpForm } from '../../../helper'
import DialogTitle from '../components/BoxTitle'
import NotVisibleForm from '../components/NotVisibleForm'
import ModifiedContent from '../components/ModifiedContent'

let dialogWidth = 585

function Details({ dialog, setOpen, setSnackWarning }) {
  const modifiedContentRef = useRef(null)

  if (dialog?.form) {
    // console.log(dialog.form)
  }

  async function handleSave() {
    let newForm = { ...dialog.formSend }

    // if (modifiedContentRef.current.value) {
    let modifyId = dialog.form[8].valueId
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
      let reasonId = dialog.form[9].valueId
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
            titleName='Head Shape'
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
                        defaultChecked={dialog.form[0].content !== ''}
                        sx={{ p: 0.5 }}
                        onChange={e => handleChange(e, dialog.form[0])}
                      />
                    }
                    label='Brachycephaly'
                    sx={{ m: 0, width: 250 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[4].content !== ''}
                        onChange={e => handleChange(e, dialog.form[4])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Prominent occiput'
                    sx={{ m: 0, width: 250 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[1].content !== ''}
                        onChange={e => handleChange(e, dialog.form[1])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Dolichocephaly'
                    sx={{ m: 0, width: 250 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[5].content !== ''}
                        onChange={e => handleChange(e, dialog.form[5])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Cloverleaf shape'
                    sx={{ m: 0, width: 250 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[2].content !== ''}
                        onChange={e => handleChange(e, dialog.form[2])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    sx={{ m: 0, width: 250 }}
                    label='Microcephaly'
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[6].content !== ''}
                        onChange={e => handleChange(e, dialog.form[6])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Lemon sign'
                    sx={{ m: 0, width: 250 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[3].content !== ''}
                        onChange={e => handleChange(e, dialog.form[3])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Prominent forehead'
                    sx={{ m: 0, width: 250 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={dialog.form[7].content !== ''}
                        onChange={e => handleChange(e, dialog.form[7])}
                        sx={{ p: 0.5 }}
                      />
                    }
                    label='Strawberry sign'
                    sx={{ m: 0, width: 250 }}
                  />
                </>
              ) : (
                <NotVisibleForm
                  dataForm={dialog.form[9]}
                  handleChange={handleChange}
                  width={dialogWidth - 28}
                />
              )}
              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[8]}
                width={dialogWidth - 28}
                row={dialog.type !== 'Not Visible' ? 8 : 5}
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
