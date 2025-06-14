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
import { formDataToObject2 } from '../../../../../utils'
import { DialogActions } from '@mui/material'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = [
  'Occipital',
  'Parietal Left',
  'Parietal Right',
  'Frontal',
  'Ethmoidal',
]
const option2 = ['Left', 'Right', 'Both Sides']
const option3 = [
  'Borderline (9 to 11mm)',
  'Mild (12 to 13mm)',
  'Moderate (14 to 15mm)',
  'Severe (>15mm)',
]
const option4 = ['Alobar', 'Semilobar', 'Lobar']
const option5 = ['Complete Agenesis', 'Patial Agenesis']
const option6 = [
  'Banana Shaped',
  'Hypoplastic Left',
  'Hypoplastic Right',
  'Hypoplastic Both Sides',
]

let rowValueId = []
let rowContent = {}

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
    return (
      <FormControl size='small' sx={{ ...inputStyle, width, mr: 3 }}>
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
  const section7 = useRef(null)
  const section8 = useRef(null)
  const section9 = useRef(null)

  const formNameMap = {
    'Cranial vault': section1,
    'Parenchyma defect': section2,
    Ventriculomegaly: section3,
    Hydranencephaly: null,
    Holoprosencephaly: section4,
    'Corpus callosum': section5,
    'Posterior Fossa': section6,
    'Choroid plexus cyst': section7,
    'Arachnoid cyst': section8,
    'Vascular defect': section9,
    Iniencephaly: null,
  }

  const nameArr = Object.keys(formNameMap).map(key => key)

  const memberArr = [
    ['Anencephaly', 'Exencephaly', 'Meningocele', 'Encephalocele'],
    ['Calcification', 'Schizencephaly', 'Hyperechogenic', 'Porencephalic cyst'],
    ['Ventriculomegaly'],
    ['Hydranencephaly'],
    ['Holoprosencephaly'],
    ['Corpus callosum'],
    [
      'Posterior Fossa',
      'Cerebellaum',
      'Dilated Cisterna Magna',
      'Vermis',
      'PF Cyst',
    ],
    [
      'Choroid plexus cyst',
      'Choroid Plexus Cyst(Left)',
      'Choroid Plexus Cyst(Right)',
    ],
    ['Arachnoid cyst'],
    ['Vein of Gallen Aneurysm', 'Circle of Willis'],
    ['Iniencephaly'],
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
        let newForm = formDataToObject2(data)

        Object.keys(rowContent).forEach(key => {
          if (newForm[key]?.value) {
            let data = `${newForm[key].value.split('-')[0]}: `
            if (rowContent[key].length === 1) data = ''

            let member = []
            rowContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) {
                if (newForm[valueId].value !== 'Choroid plexus cyst') {
                  let val = newForm[valueId].value.split('-')

                  let mes = val[2] || ''

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

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[26].valueId
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

    let modifyId = dialog.form[25].valueId
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
            titleName='Brain'
            type={dialog.type}
            handleClose={handleClose}
          />
          <DialogContent
            sx={{
              ...dialogContentBgColor,
              ...flexCenter,
              p: 1,
              width: dialogWidth,
              //   overflowY: 'auto',
              //   pt: 25,
            }}
          >
            <form autoComplete='off' ref={formRef}>
              {['Abnormal', 'Details'].includes(dialog.type) ? (
                <>
                  <div style={flexCenter}>
                    {CheckBox(dialog.form[0], 220)}

                    <div
                      ref={section1}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',

                        //   border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[1], 210)}
                        {CheckBox(dialog.form[3], 210)}
                        {SelectOption(
                          `${dialog.form[3].valueId}-option-1`,
                          dialog.form[3].content.split('-')[1] || '',
                          option1
                        )}
                      </div>

                      <div
                        style={{ ...flexCenter, width: '100%', marginTop: 9 }}
                      >
                        {CheckBox(dialog.form[2], 210)}
                        {CheckBox(dialog.form[4], 210)}
                        {SelectOption(
                          `${dialog.form[4].valueId}-option-1`,
                          dialog.form[4].content.split('-')[1] || '',
                          option1
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[5], 220)}

                    <div
                      ref={section2}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[6], 210)}
                        <>
                          {SelectOption(
                            `${dialog.form[6].valueId}-option-1`,
                            dialog.form[6].content.split('-')[1] || '',
                            option2
                          )}
                          {CheckBox(dialog.form[9], 210)}
                        </>
                      </div>

                      <div
                        style={{ ...flexCenter, width: '100%', marginTop: 9 }}
                      >
                        {CheckBox(dialog.form[7], 210)}
                        <>
                          {SelectOption(
                            `${dialog.form[7].valueId}-option-1`,
                            dialog.form[7].content.split('-')[1] || '',
                            option2
                          )}
                        </>
                      </div>

                      <div
                        style={{ ...flexCenter, width: '100%', marginTop: 9 }}
                      >
                        {CheckBox(dialog.form[8], 210)}
                        <>
                          {SelectOption(
                            `${dialog.form[8].valueId}-option-1`,
                            dialog.form[8].content.split('-')[1] || '',
                            option2
                          )}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginLeft: 8,
                            }}
                          >
                            {Measurement(
                              `${dialog.form[8].valueId}-text-1`,
                              `${dialog.form[8].valueId}-text-2`,
                              `${dialog.form[8].valueId}-text-3`,
                              dialog.form[8].content
                                ?.split('-')[2]
                                ?.split('x')
                                ?.map((x, i) => {
                                  if (i === 2) return x.slice(0, -3)
                                  return x
                                }) || ['', '', '']
                            )}
                          </div>
                        </>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[10], 220)}
                    <div
                      ref={section3}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <>
                        {SelectOption(
                          `${dialog.form[10].valueId}-option-1`,
                          dialog.form[10].content.split('-')[1] || '',
                          option2,
                          180
                        )}
                        {SelectOption(
                          `${dialog.form[10].valueId}-option-2`,
                          dialog.form[10].content.split('-')[2] || '',
                          option3,
                          230
                        )}
                      </>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[11], 220)}
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[12], 220)}
                    <div
                      ref={section4}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <>
                        {SelectOption(
                          `${dialog.form[12].valueId}-option-1`,
                          dialog.form[12].content.split('-')[1] || '',
                          option4,
                          188
                        )}
                      </>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[13], 220)}
                    <div
                      ref={section5}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <>
                        {SelectOption(
                          `${dialog.form[13].valueId}-option-1`,
                          dialog.form[13].content.split('-')[1] || '',
                          option5,
                          188
                        )}
                      </>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[14], 220)}
                    <div
                      ref={section6}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                        // paddingTop: 5,
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[15], 190)}
                        {SelectOption(
                          `${dialog.form[15].valueId}-option-1`,
                          dialog.form[15].content.split('-')[1] || '',
                          option6,
                          220
                        )}
                        {CheckBox(dialog.form[17], 210)}
                      </div>
                      <div
                        style={{ ...flexCenter, width: '100%', marginTop: 9 }}
                      >
                        {CheckBox(dialog.form[16], 190)}
                        {SelectOption(
                          `${dialog.form[16].valueId}-option-1`,
                          dialog.form[16].content.split('-')[1] || '',
                          option5,
                          220
                        )}
                        {CheckBox(dialog.form[18], 210)}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[19], 220)}
                    <div
                      ref={section7}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                        // paddingTop: 5,
                      }}
                    >
                      <div style={{ ...flexCenter, width: '100%' }}>
                        {CheckBox(dialog.form[27], 190)}
                        {Measurement(
                          `${dialog.form[27].valueId}-text-1`,
                          `${dialog.form[27].valueId}-text-2`,
                          `${dialog.form[27].valueId}-text-3`,
                          dialog.form[27].content
                            ?.split('-')[1]
                            ?.split('x')
                            ?.map((x, i) => {
                              if (i === 2) return x.slice(0, -3)
                              return x
                            }) || ['', '', '']
                        )}
                      </div>
                      <div
                        style={{ ...flexCenter, width: '100%', marginTop: 9 }}
                      >
                        {CheckBox(dialog.form[28], 190)}
                        {Measurement(
                          `${dialog.form[28].valueId}-text-1`,
                          `${dialog.form[28].valueId}-text-2`,
                          `${dialog.form[28].valueId}-text-3`,
                          dialog.form[28].content
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

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[20], 220)}
                    <div
                      ref={section8}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[20].valueId}-option-1`,
                          dialog.form[20].content.split('-')[1] || '',
                          option2,
                          162
                        )}

                        {Measurement(
                          `${dialog.form[20].valueId}-text-1`,
                          `${dialog.form[20].valueId}-text-2`,
                          `${dialog.form[20].valueId}-text-3`,
                          dialog.form[20].content
                            ?.split('-')[2]
                            ?.split('x')
                            ?.map((x, i) => {
                              if (i === 2) return x.slice(0, -3)
                              return x
                            }) || ['', '', '']
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[21], 220)}
                    <div
                      ref={section9}
                      style={{
                        ...flexCenter,
                        width: 675,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        //   border: '1px solid white',
                      }}
                    >
                      {CheckBox(dialog.form[22], 220)}
                      {CheckBox(dialog.form[23], 220)}
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[24], 220)}
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[26].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[26])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[25]}
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
