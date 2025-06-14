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
import { formDataToObject3 } from '../../../../../utils'
import { DialogActions } from '@mui/material'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = ['Mild', 'Moderate', 'Severe']
const option2 = ['Left', 'Right', 'Both Sides']
const option3 = ['Normal', 'Echogenic', 'Cystic']
const option4 = ['Infantile Type', 'Adult Type']

let rowValueId = []
let rowContent = {}
let adrenalGlandsId = ''
let adrenalGlandsMember = []

function Details({ dialog, setOpen, setSnackWarning }) {
  const Measurement = (n1, n2, n3, defaultValue = ['', '', ''], width = 60) => {
    return (
      <>
        <TextField
          name={n1}
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
            width,
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={defaultValue[0]}
          onChange={handleChange}
        />
        X
        <TextField
          name={n2}
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
            width,
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={defaultValue[1]}
          onChange={handleChange}
        />
        X
        <TextField
          name={n3}
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
            width,
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={defaultValue[2]}
          onChange={handleChange}
        />
        &nbsp; mm
      </>
    )
  }
  const SelectOption = (name, defaultValue = '', options = [], width = 150) => {
    let master = 'no'
    let valueName = name
    let dataName = ''
    if (name.indexOf('-option') === -1) {
      master = 'yes'
      let arr = name.split('-')
      valueName = arr[0]
      dataName = arr[1]
    }

    return (
      <FormControl size='small' sx={{ ...inputStyle, width, mr: 3 }}>
        <Select
          size='small'
          variant='outlined'
          notched
          name={valueName}
          sx={{
            fontSize: 16,
            p: 0,
            color: theme => MODE[theme.palette.mode].dataGrid.font,
          }}
          onChange={handleChange}
          defaultValue={!options.includes(defaultValue) ? '' : defaultValue}
          inputProps={{ 'data-master': master, 'data-name': dataName }}
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

    if (name.indexOf('Left Adrenal') > -1) label = 'Left'
    else if (name.indexOf('Right Adrenal') > -1) label = 'Right'

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

  const [dialogWidth, setDialogWidth] = useState(920)
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
    Hydronephrosis: section1,
    Multicystic: section2,
    Polycystic: section3,
    'Renal Agenesis': section4,
    'Pelvic Kidney': section5,
    'Adrenal Glands': section6,
    'Left Adrenal Tumour': null,
    'Left Adrenal Cyst': null,
  }

  const nameArr = Object.keys(formNameMap).map(key => key)

  const memberArr = [
    [
      'Hydronephrosis',
      'Left Dilatation',
      'Left Cortex',
      'Right Dilatation',
      'Right Cortex',
    ],
    ['Multicystic'],
    ['Polycystic'],
    ['Renal Agenesis'],
    ['Pelvic Kidney'],
    ['Adrenal Glands'],
    ['Left Adrenal Tumour', 'Right Adrenal Tumour'],
    ['Left Adrenal Cyst', 'Right Adrenal Cyst'],
  ]

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 930)
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

      // console.log(rowContent)

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
        let newForm = formDataToObject3(data)
        // console.log(newForm)
        // console.log(rowContent)

        newForm = checkAdrenal(newForm)

        // console.log('adrenalGlandsId', adrenalGlandsId)
        // console.log('adrenalGlandsMember', adrenalGlandsMember)

        // console.log(newForm)

        Object.keys(rowContent).forEach(key => {
          if (newForm[key]?.value) {
            let data = `${newForm[key].value.split('-')[0]}: `
            if (rowContent[key].length === 1) data = ''

            if (newForm[key].name.indexOf('Adrenal Tumour') > -1)
              data = 'Adrenal Tumour: '
            else if (newForm[key].name.indexOf('Adrenal Cyst') > -1)
              data = 'Adrenal Cyst: '

            let member = []
            rowContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) {
                // console.log(newForm[valueId].value)
                let val = newForm[valueId].value.split('-')
                // console.log(val)
                let mes = val[2] || ''

                if (val[0] === 'Hydronephrosis') {
                  val[0] = val[1]
                  val = val[0]?.split('-') || ''
                } else if (newForm[valueId]?.master === 'yes') {
                  val[0] = `${newForm[valueId].name} (${val[0]})`
                }

                if (val[0] && val[1]) {
                  let colon = ''
                  let v = ` (${val[1]})`
                  if (rowContent[key].length === 1) {
                    colon = ':'
                    v = ` ${val[1]}`
                  }

                  val = val[0] + colon + v
                }

                if (mes) val += `, ${mes}`

                member.push(val)
              }
            })

            data += member.join(', ')

            contentArr.push(data)
          }
        })

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  function checkAdrenal(newForm) {
    if (!adrenalGlandsId) {
      adrenalGlandsId = dialog.form.find(
        form => form.name === 'Adrenal Glands'
      ).valueId
    }

    let hasAdrenalGlands = newForm[adrenalGlandsId]?.value

    if (!hasAdrenalGlands) {
      if (adrenalGlandsMember.length === 0) {
        adrenalGlandsMember = dialog.form
          .filter(form => form.name.indexOf('Adrenal') > -1)
          .map(form => form.valueId)
      }

      adrenalGlandsMember.forEach(valueId => {
        delete newForm[valueId]
      })
    }

    return newForm
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[15].valueId
      newForm = {
        [reasonId]: {
          type: 'T',
          value: notVisibleRef.current.value.replace(/(\r\n|\r|\n)/g, '<br />'),
        },
      }
    } else {
      const data = qsa(['input', 'select', 'checkbox'], formRef.current)
      newForm = formDataToObject3(data)

      Object.keys(rowContent).forEach(key => {
        if (!newForm[key]?.value) {
          rowContent[key].forEach(valueId => {
            //   newForm[valueId].value = ''
            delete newForm[valueId]
          })
        }
      })
    }

    newForm = checkAdrenal(newForm)

    let modifyId = dialog.form[14].valueId
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
            titleName='Kidneys'
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
                    {CheckBox(dialog.form[0], 210)}

                    <div
                      ref={section1}
                      style={{
                        ...flexCenter,
                        width: 690,
                        flexWrap: 'wrap',
                        display: 'none',
                      }}
                    >
                      <div
                        style={{
                          ...flexCenter,
                          width: '100%',
                          whiteSpace: 'nowrap',
                          //   border: '1px solid white',
                        }}
                      >
                        {SelectOption(
                          `${dialog.form[0].valueId}-option-1`,
                          dialog.form[0].content.split('-')[1] || '',
                          option2
                        )}
                        Left Dilatation
                        {SelectOption(
                          `${dialog.form[1].valueId}-${dialog.form[1].name}`,
                          dialog.form[1].content,
                          option1
                        )}
                        Left Cortex
                        {SelectOption(
                          `${dialog.form[3].valueId}-${dialog.form[3].name}`,
                          dialog.form[3].content,
                          option3
                        )}
                      </div>

                      <div
                        style={{
                          ...flexCenter,
                          width: '100%',
                          whiteSpace: 'nowrap',
                          marginTop: 9,
                        }}
                      >
                        <div style={{ width: 175 }}></div>
                        Right Dilatation
                        {SelectOption(
                          `${dialog.form[2].valueId}-${dialog.form[2].name}`,
                          dialog.form[2].content,
                          option1
                        )}
                        Right Cortex
                        {SelectOption(
                          `${dialog.form[4].valueId}-${dialog.form[4].name}`,
                          dialog.form[4].content,
                          option3
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[5], 210)}

                    <div
                      ref={section2}
                      style={{
                        ...flexCenter,
                        width: 690,
                        flexWrap: 'wrap',
                        display: 'none',
                      }}
                    >
                      {SelectOption(
                        `${dialog.form[5].valueId}-option-1`,
                        dialog.form[5].content.split('-')[1] || '',
                        option2
                      )}
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[6], 210)}

                    <div
                      ref={section3}
                      style={{
                        ...flexCenter,
                        width: 690,
                        flexWrap: 'wrap',
                        display: 'none',
                      }}
                    >
                      {SelectOption(
                        `${dialog.form[6].valueId}-option-1`,
                        dialog.form[6].content.split('-')[1] || '',
                        option4
                      )}
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[7], 210)}

                    <div
                      ref={section4}
                      style={{
                        ...flexCenter,
                        width: 690,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                      }}
                    >
                      {SelectOption(
                        `${dialog.form[7].valueId}-option-1`,
                        dialog.form[7].content.split('-')[1] || '',
                        option2
                      )}
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[8], 210)}

                    <div
                      ref={section5}
                      style={{
                        ...flexCenter,
                        width: 690,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                      }}
                    >
                      {SelectOption(
                        `${dialog.form[8].valueId}-option-1`,
                        dialog.form[8].content.split('-')[1] || '',
                        option2
                      )}
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[9], 210)}
                    <div
                      ref={section6}
                      style={{
                        ...flexCenter,
                        width: 690,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                      }}
                    >
                      <div style={flexCenter}>
                        <div style={{ width: 150 }}>Adrenal Tumour</div>
                        <div>{CheckBox(dialog.form[10], 70)}</div>
                        <div style={flexCenter}>
                          {Measurement(
                            `${dialog.form[10].valueId}-text-1`,
                            `${dialog.form[10].valueId}-text-2`,
                            `${dialog.form[10].valueId}-text-3`,
                            dialog.form[10].content
                              ?.split('-')[1]
                              ?.split('x')
                              ?.map((x, i) => {
                                if (i === 2) return x.slice(0, -3)
                                return x
                              }) || ['', '', '']
                          )}
                        </div>
                      </div>
                      <div style={{ ...flexCenter, marginTop: 9 }}>
                        <div style={{ width: 150 }}></div>
                        <div>{CheckBox(dialog.form[11], 70)}</div>
                        <div style={flexCenter}>
                          {Measurement(
                            `${dialog.form[11].valueId}-text-1`,
                            `${dialog.form[11].valueId}-text-2`,
                            `${dialog.form[11].valueId}-text-3`,
                            dialog.form[11].content
                              ?.split('-')[1]
                              ?.split('x')
                              ?.map((x, i) => {
                                if (i === 2) return x.slice(0, -3)
                                return x
                              }) || ['', '', '']
                          )}
                        </div>
                      </div>
                      <div style={{ ...flexCenter, marginTop: 9 }}>
                        <div style={{ width: 150 }}>Adrenal Cyst</div>
                        <div>{CheckBox(dialog.form[12], 70)}</div>
                        <div style={flexCenter}>
                          {Measurement(
                            `${dialog.form[12].valueId}-text-1`,
                            `${dialog.form[12].valueId}-text-2`,
                            `${dialog.form[12].valueId}-text-3`,
                            dialog.form[12].content
                              ?.split('-')[1]
                              ?.split('x')
                              ?.map((x, i) => {
                                if (i === 2) return x.slice(0, -3)
                                return x
                              }) || ['', '', '']
                          )}
                        </div>
                      </div>
                      <div style={{ ...flexCenter, marginTop: 9 }}>
                        <div style={{ width: 150 }}></div>
                        <div>{CheckBox(dialog.form[13], 70)}</div>
                        <div style={flexCenter}>
                          {Measurement(
                            `${dialog.form[13].valueId}-text-1`,
                            `${dialog.form[13].valueId}-text-2`,
                            `${dialog.form[13].valueId}-text-3`,
                            dialog.form[13].content
                              ?.split('-')[1]
                              ?.split('x')
                              ?.map((x, i) => {
                                if (i === 2) return x.slice(0, -3)
                                return x
                              }) || ['', '', '']
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[15].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[15])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[14]}
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
