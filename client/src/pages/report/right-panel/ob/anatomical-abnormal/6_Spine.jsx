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
import { capitalizeFirstLetter, formDataToObject2 } from '../../../../../utils'
import { DialogActions } from '@mui/material'

let rowValueId = []
let rowContent = {}
const flexCenter = { display: 'flex', alignItems: 'center' }

const option = ['External', 'Mainly External', 'Mainly Internal', 'Internal']

const lastCheckBox = [
  'Celebellum Absent',
  'Celebellum Banana',
  'Lemon Shaped Head',
]

function Details({ dialog, setOpen, setSnackWarning }) {
  const SelectOption = (name, defaultValue = '', options = [], width = 150) => {
    return (
      <FormControl size='small' sx={{ ...inputStyle, width, mr: 1 }}>
        <Select
          size='small'
          variant='outlined'
          notched
          name={name}
          sx={{
            fontSize: 16,
            p: 0,
            color: theme => MODE[theme.palette.mode].dataGrid.font,
          }}
          onChange={handleChange}
          defaultValue={!options.includes(defaultValue) ? '' : defaultValue}
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
    if (name.indexOf('-') > -1) {
      label = capitalizeFirstLetter(name.split('-')[1])
      // content = capitalizeFirstLetter(name.split('-')[1])
    }
    // if (name.indexOf('(Left)') > -1) label = 'Left'
    // else if (name.indexOf('(Right)') > -1) label = 'Right'

    if (name === 'Sacrococcygeal Teratoma')
      content = content.split('-')[0] || ''

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

  const [dialogWidth, setDialogWidth] = useState(700)
  const modifiedContentRef = useRef(null)
  const notVisibleRef = useRef(null)
  const formRef = useRef(null)

  const section1 = useRef(null)
  const section2 = useRef(null)
  const section3 = useRef(null)
  const section4 = useRef(null)
  const section5 = useRef(null)
  const section6 = useRef(null)

  const formNameMap = {
    Hemivertebra: section1,
    Kyphosis: section2,
    'Sacral Agenesis': null,
    'Sacrococcygeal Teratoma': section3,
    Sirenomelia: null,
    Scoliosis: section4,
    'Spina Bifida': section5,
  }

  const nameArr = Object.keys(formNameMap).map(key => key)

  const memberArr = [
    ['H-cervical', 'H-thoracic', 'H-lumber', 'H-sacral', 'H-segments'],
    ['K-cervical', 'K-thoracic', 'K-lumber', 'K-sacral', 'K-segments'],
    ['Sacral Agenesis'],
    ['Sacrococcygeal Teratoma'],
    ['Sirenomelia'],
    ['S-cervical', 'S-thoracic', 'S-lumber', 'S-sacral', 'S-segments'],
    ['SB-cervical', 'SB-thoracic', 'SB-lumber', 'SB-sacral', 'SB-segments'],
  ]

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 900)
      rowValueId = dialog.form
        .filter(form => nameArr.includes(form.name))
        .map(form => form.valueId)
      // console.log(dialog.form)
      // console.log(rowValueId)

      rowValueId.forEach((id, index) => {
        let member = []
        memberArr[index].forEach(name => {
          let test = dialog.form.find(form => form.name === name)
          if (test) {
            member.push(test.valueId)
          }
        })

        rowContent[id] = member
      })

      // console.log(rowContent)

      setTimeout(() => {
        dialog.form.forEach(form => {
          if (nameArr.includes(form.name)) {
            if (form.content)
              if (formNameMap[form.name]) {
                formNameMap[form.name].current.style.display = 'block'

                if (form.name === 'Spina Bifida')
                  section6.current.style.display = 'block'
              }
          }
        })
      }, 20)
    }

    return () => {}
    // eslint-disable-next-line
  }, [dialog])

  function handleChange(e, form) {
    const { value, checked } = e.target

    if (form && nameArr.includes(form.name)) {
      if (formNameMap[form.name])
        formNameMap[form.name].current.style.display = checked
          ? 'block'
          : 'none'

      if (form.name === 'Spina Bifida')
        section6.current.style.display = checked ? 'block' : 'none'
    }

    if (form && form.name === 'Reason') {
      modifiedContentRef.current.value = value || ''
    } else {
      setTimeout(() => {
        let contentArr = []
        const data = qsa(['input', 'select', 'checkbox'], formRef.current)
        let newForm = formDataToObject2(data)

        Object.keys(rowContent).forEach(key => {
          if (newForm[key]?.value) {
            let data = `${newForm[key].value.split('-')[0]}: `
            if (rowContent[key].length === 1) data = ''

            let member = []
            rowContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) {
                let val = newForm[valueId].value.split('-')

                if (val[0] && val[1]) {
                  let colon = ''
                  let v = ''
                  let v2 = val[2] || ''
                  if (rowContent[key].length === 1) {
                    colon = ':'
                    v = ` ${val[1]}${v2 ? ', ' + v2 : ''}`
                  }

                  val = val[0] + colon + v
                }

                if (newForm[valueId].name.indexOf('segments') > -1) {
                  let s = 's'
                  if (val[0] === '1') s = ''
                  val += ' segment' + s
                }
                member.push(val)
              }
            })

            data += member.join(', ')

            contentArr.push(data)
          }
        })

        let id = dialog.form.find(form => form.name === 'Spina Bifida').valueId

        if (newForm[id]?.value) {
          let lastArr = []
          Object.keys(newForm).forEach(key => {
            if (lastCheckBox.includes(newForm[key]?.value))
              lastArr.push(newForm[key].value)
          })

          if (lastArr.length > 0) {
            contentArr.push('Arnold Chiari Malformation: ' + lastArr.join(', '))
          }
        }

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[31].valueId
      newForm = {
        [reasonId]: {
          type: 'T',
          value: notVisibleRef.current.value.replace(/(\r\n|\r|\n)/g, '<br />'),
        },
      }
    } else {
      const data = qsa(['input', 'select', 'checkbox'], formRef.current)
      newForm = formDataToObject2(data)

      Object.keys(rowContent).forEach(key => {
        if (!newForm[key]?.value) {
          rowContent[key].forEach(valueId => {
            //   newForm[valueId].value = ''
            delete newForm[valueId]
          })
        }
      })
    }

    let modifyId = dialog.form[30].valueId
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
            titleName='Spine'
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
                  <div style={flexCenter}>
                    {CheckBox(dialog.form[0], 230)}

                    <div
                      ref={section1}
                      style={{
                        ...flexCenter,
                        width: 650,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[1], 120)}
                        {CheckBox(dialog.form[2], 120)}
                        {CheckBox(dialog.form[3], 120)}
                        {CheckBox(dialog.form[4], 120)}
                        <TextField
                          name={`${dialog.form[5].valueId}`}
                          size='small'
                          variant='outlined'
                          // inputProps={{ 'data-value': content, 'data-name': name }}
                          inputProps={{
                            'data-name': dialog.form[5].name,
                            style: {
                              textAlign: 'right',
                              paddingRight: 5,
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            //   ml: 1,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          defaultValue={
                            dialog.form[5].content.split(' ')[0] || ''
                          }
                          onChange={handleChange}
                        />
                        segment
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[6], 230)}
                    <div
                      ref={section2}
                      style={{
                        ...flexCenter,
                        width: 650,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[7], 120)}
                        {CheckBox(dialog.form[8], 120)}
                        {CheckBox(dialog.form[9], 120)}
                        {CheckBox(dialog.form[10], 120)}
                        <TextField
                          name={`${dialog.form[11].valueId}`}
                          size='small'
                          variant='outlined'
                          inputProps={{
                            'data-name': dialog.form[11].name,
                            style: {
                              textAlign: 'right',
                              paddingRight: 5,
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            //   ml: 1,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          defaultValue={
                            dialog.form[11].content.split(' ')[0] || ''
                          }
                          onChange={handleChange}
                        />
                        segment
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[12], 230)}
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[13], 230)}
                    <div
                      ref={section3}
                      style={{
                        ...flexCenter,
                        width: 650,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {SelectOption(
                          `${dialog.form[13].valueId}-option-1`,
                          dialog.form[13].content?.split('-')[1] || '',
                          option,
                          170
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[14], 230)}
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[15], 230)}
                    <div
                      ref={section4}
                      style={{
                        ...flexCenter,
                        width: 650,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[16], 120)}
                        {CheckBox(dialog.form[17], 120)}
                        {CheckBox(dialog.form[18], 120)}
                        {CheckBox(dialog.form[19], 120)}
                        <TextField
                          name={`${dialog.form[20].valueId}`}
                          size='small'
                          variant='outlined'
                          inputProps={{
                            'data-name': dialog.form[20].name,
                            style: {
                              textAlign: 'right',
                              paddingRight: 5,
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            //   ml: 1,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          defaultValue={
                            dialog.form[20].content.split(' ')[0] || ''
                          }
                          onChange={handleChange}
                        />
                        segment
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[21], 230)}
                    <div
                      ref={section5}
                      style={{
                        ...flexCenter,
                        width: 650,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[22], 120)}
                        {CheckBox(dialog.form[23], 120)}
                        {CheckBox(dialog.form[24], 120)}
                        {CheckBox(dialog.form[25], 120)}
                        <TextField
                          name={`${dialog.form[26].valueId}`}
                          size='small'
                          variant='outlined'
                          inputProps={{
                            'data-name': dialog.form[26].name,
                            style: {
                              textAlign: 'right',
                              paddingRight: 5,
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            //   ml: 1,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          defaultValue={
                            dialog.form[26].content.split(' ')[0] || ''
                          }
                          onChange={handleChange}
                        />
                        segment
                      </div>
                    </div>
                  </div>

                  <div
                    ref={section6}
                    style={{ ...flexCenter, marginTop: 9, display: 'none' }}
                  >
                    <div
                      style={{
                        ...flexCenter,
                        width: 800,
                        flexWrap: 'wrap',
                        rowGap: 11,
                      }}
                    >
                      <div style={{ width: 230 }}>
                        Arnold Chiari Malformation
                      </div>
                      {CheckBox(dialog.form[27], 190)}
                      {CheckBox(dialog.form[28], 190)}
                      {CheckBox(dialog.form[29], 190)}
                    </div>
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[31].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[31])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[30]}
                width={dialogWidth - 26}
                row={dialog.type !== 'Not Visible' ? 8 : 5}
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
