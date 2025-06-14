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
import { formDataToObject4 } from '../../../../../utils'
import { DialogActions } from '@mui/material'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = ['Lip', 'Palate', 'Lip and Palate']

const option2 = ['Left', 'Right', 'Middle', 'Both Sides']

const option3 = ['Abnormal', 'Small', 'Low Lying']

const option4 = [
  'Anophthalmia',
  'Microphthalmia',
  'Cyclops',
  'Hypoteloism',
  'Hypertelorism',
  'Echodense Lens',
]

const option5 = ['Absent', 'Hypoplastic', 'Proboscis', 'Singular Nostril']

const lastCheckBox = [
  'Flat Face',
  'Macroglossia',
  'Micrognathia',
  'Facial Tumour',
]

let rowValueId = []
let rowContent = {}

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

    if (name.indexOf('(Left)') > -1) label = 'Left'
    else if (name.indexOf('(Right)') > -1) label = 'Right'

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

  const formNameMap = {
    Cleft: section1,
    Ears: section2,
    Eyes: section3,
    Nose: section4,
  }

  const nameArr = Object.keys(formNameMap).map(key => key)

  const memberArr = [['Cleft'], ['Ears'], ['Eyes'], ['Nose']]

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 700)
      rowValueId = dialog.form
        .filter(form => nameArr.includes(form.name))
        .map(form => form.valueId)
      // console.log(dialog.form)
      //   console.log(rowValueId)

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

      setTimeout(() => {
        dialog.form.forEach(form => {
          if (nameArr.includes(form.name)) {
            if (form.content)
              if (formNameMap[form.name])
                formNameMap[form.name].current.style.display = 'block'
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
    }

    if (form && form.name === 'Reason') {
      modifiedContentRef.current.value = value || ''
    } else {
      setTimeout(() => {
        let contentArr = []
        const data = qsa(['input', 'select', 'checkbox'], formRef.current)
        let newForm = formDataToObject4(data)

        Object.keys(rowContent).forEach(key => {
          if (newForm[key]?.value) {
            let data = ''
            // let data = `${newForm[key].value.split('-')[0]}: `
            // if (rowContent[key].length === 1) data = ''

            let member = []
            rowContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) {
                let val = newForm[valueId].value.split('-')
                if (newForm[valueId].name === 'Cleft') {
                  let [v1, v2, v3, v4] = val

                  let v = [v2, v3].filter(v => v !== '')
                  let colon = ': '

                  val = v1 + colon + v.join(', ')

                  if (v4) val += ', ' + v4 + 'mm'
                } else {
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
                }

                member.push(val)
              }
            })

            data += member.join(', ')

            contentArr.push(data)
          }
        })

        let lastArr = []
        Object.keys(newForm).forEach(key => {
          if (lastCheckBox.includes(newForm[key]?.value)) {
            lastArr.push(newForm[key].value)
          }
        })

        contentArr.push(lastArr.join(', '))
        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[9].valueId
      newForm = {
        [reasonId]: {
          type: 'T',
          value: notVisibleRef.current.value.replace(/(\r\n|\r|\n)/g, '<br />'),
        },
      }
    } else {
      const data = qsa(['input', 'select', 'checkbox'], formRef.current)
      newForm = formDataToObject4(data)

      Object.keys(rowContent).forEach(key => {
        if (!newForm[key]?.value) {
          rowContent[key].forEach(valueId => {
            //   newForm[valueId].value = ''
            delete newForm[valueId]
          })
        }
      })
    }

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
            titleName='Face'
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
                    {CheckBox(dialog.form[0], 200)}

                    <div
                      ref={section1}
                      style={{
                        ...flexCenter,
                        width: 480,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {SelectOption(
                          `${dialog.form[0].valueId}-option-1`,
                          dialog.form[0].content?.split('-')[1] || '',
                          option1,
                          170
                        )}
                        {SelectOption(
                          `${dialog.form[0].valueId}-option-2`,
                          dialog.form[0].content?.split('-')[2] || '',
                          option2,
                          160
                        )}
                        <TextField
                          name={`${dialog.form[0].valueId}-option-3`}
                          size='small'
                          variant='outlined'
                          inputProps={{
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
                            dialog.form[0].content
                              ?.split('-')[3]
                              ?.split(' ')[0] || ''
                          }
                          onChange={handleChange}
                        />
                        mm
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[1], 200)}
                    <div
                      ref={section2}
                      style={{
                        ...flexCenter,
                        width: 480,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {SelectOption(
                          `${dialog.form[1].valueId}-option-1`,
                          dialog.form[1].content.split('-')[1] || '',
                          option3,
                          170
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[2], 200)}
                    <div
                      ref={section3}
                      style={{
                        ...flexCenter,
                        width: 480,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {SelectOption(
                          `${dialog.form[2].valueId}-option-1`,
                          dialog.form[2].content.split('-')[1] || '',
                          option4,
                          170
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[6], 200)}
                    <div
                      ref={section4}
                      style={{
                        ...flexCenter,
                        width: 480,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {SelectOption(
                          `${dialog.form[6].valueId}-option-1`,
                          dialog.form[6].content.split('-')[1] || '',
                          option5,
                          170
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[3], 145)}
                    {CheckBox(dialog.form[4], 145)}
                    {CheckBox(dialog.form[5], 145)}
                    {CheckBox(dialog.form[7], 145)}
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[9].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[9])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[8]}
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
