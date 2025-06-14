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
import {
  capitalizeFirstLetter,
  capitalizeSentence,
  formDataToObject2,
} from '../../../../../utils'
import { DialogActions } from '@mui/material'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = ['Left', 'Right', 'Both Sides']
const option2 = ['Macrocystic', 'Microcystic']

const option3 = ['Mild', 'Moderate', 'Severe']
const option4 = ['Extralobar', 'Intralobar']
const option5 = ['Yes', 'No']

let rowValueId = []
let rowContent = {}

function Details({ dialog, setOpen, setSnackWarning }) {
  const InputText = (form, name, defaultValue = '', width = 60) => {
    let valueId = name

    return (
      <>
        <TextField
          name={valueId}
          size='small'
          variant='outlined'
          inputProps={{
            'data-name': name,
            'data-mastername': form.name || '',
            style: {
              textAlign: 'right',
              paddingRight: 7,
            },
          }}
          sx={{
            ...inputStyle,
            width,
            backgroundColor: theme =>
              theme.palette.mode === 'light' ? 'white' : '#393939',
          }}
          defaultValue={defaultValue}
          onChange={e => handleChange(e, form)}
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

    return (
      <FormControlLabel
        control={
          <Checkbox
            name={valueId + ''}
            defaultChecked={content?.split('-')[0] !== ''}
            sx={{ p: 0.5 }}
            inputProps={{ 'data-value': label, 'data-name': name }}
            //   onChange={handleChange ? e => handleChange(e,form) : undefined}
            onChange={e => handleChange(e, form)}
          />
        }
        label={capitalizeSentence(label)}
        sx={{
          m: 0,
          width,
        }}
      />
    )
  }

  const CheckBox2 = (label, name, value) => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            defaultChecked={value !== ''}
            sx={{ p: 0.5 }}
            inputProps={{ 'data-value': label, 'data-name': name }}
            onChange={e => handleChange(e)}
          />
        }
        label={capitalizeSentence(label)}
        sx={{
          m: 0,
          mr: 1.5,
          whiteSpace: 'nowrap',
          //   width,
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
    'Bronchogenic cysts': section1,
    'Cystic abenomatoid malformation': section2,
    'Congenital diaphragmatic hernia': section3,
    Hydrothorax: section4,
    Sequestration: section5,
    Hypoplasia: section6,
    'Thorax diameter(T)': null,
    'Thorax circ.': null,
    'Thorax diameter(A-P)': null,
    'TC/AC': null,
    'Lung diameter(left)': null,
    'Lung diameter(right)': null,
    'Chest wall': null,
    'Mediastinal shift': null,
  }

  const nameArr = Object.keys(formNameMap).map(key => key)

  const memberArr = [
    ['Bronchogenic cysts'],
    ['Cystic abenomatoid malformation'],
    ['Congenital diaphragmatic hernia'],
    ['Hydrothorax'],
    ['Sequestration'],
    ['Hypoplasia'],
    ['Thorax diameter(T)'],
    ['Thorax circ.'],
    ['Thorax diameter(A-P)'],
    ['TC/AC'],
    ['Lung diameter(left)'],
    ['Lung diameter(right)'],
    ['Chest wall'],
    ['Mediastinal shift'],
  ]

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 930)
      rowValueId = dialog.form
        .filter(form => nameArr.includes(form.name))
        .map(form => form.valueId)
      //   console.log(dialog.form)
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
    const { value, checked, type } = e.target

    if (form && type === 'checkbox' && nameArr.includes(form.name)) {
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
            let data = ''

            let member = []
            rowContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) {
                let val = newForm[valueId].value.split('-')
                val[0] = capitalizeSentence(val[0])
                let v2 = val[2] || ''

                if (val[0] && val[1]) {
                  let colon = ''
                  let v = ` (${val[1]})`
                  if (rowContent[key].length === 1) {
                    colon = ':'
                    v = ` ${val[1]}`
                  }

                  val = val[0] + colon + v
                }

                if (newForm[valueId].name === 'Bronchogenic cysts') {
                  let unit = ' mm'
                  if (v2) val += `, ${v2}${unit}`
                } else {
                  if (newForm[valueId].name === 'Hydrothorax') {
                    if (v2) val += `, Degree ${v2}`
                  } else {
                    if (v2) val += `, ${v2}`
                  }
                }

                if (
                  newForm[valueId].name === 'Congenital diaphragmatic hernia'
                ) {
                  let arr = []
                  let id = dialog.form.find(
                    form => form.name === 'Congenital diaphragmatic hernia'
                  ).valueId
                  Object.keys(newForm).forEach(key => {
                    if (key.indexOf(`${id}-option`) > -1) {
                      if (newForm[key]?.value)
                        arr.push(capitalizeFirstLetter(newForm[key].value))
                    }
                  })

                  if (arr.length > 0) val += ', ' + arr.join(', ')
                }

                if (newForm[valueId].value === 'Chest wall') {
                  let arr = Object.keys(newForm)
                    .filter(key => key.indexOf(`${valueId}-option`) > -1)
                    .filter(key => newForm[key].value !== '')
                    .map(key => {
                      return capitalizeSentence(newForm[key].value)
                    })

                  if (arr.length > 0) {
                    val = val + ': ' + arr.join(', ')
                  } else {
                    val = ''
                  }
                }

                if (newForm[valueId].name === '271') {
                  val = 'Mediastinal Shift: ' + newForm[valueId].value
                }

                if (valueId >= 264 && valueId <= 269) {
                  val =
                    `${newForm[valueId].name}: ` + newForm[valueId].value + 'mm'
                }

                member.push(val)
              }
            })

            data += member.join(', ')

            if (data) contentArr.push(data)
          }
        })

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
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
      newForm = formDataToObject2(data)
      //   console.log(newForm)
      Object.keys(rowContent).forEach(key => {
        if (!newForm[key]?.value) {
          rowContent[key].forEach(valueId => {
            //   newForm[valueId].value = ''
            delete newForm[valueId]
          })
        }
      })

      let id = dialog.form.find(
        form => form.name === 'Congenital diaphragmatic hernia'
      ).valueId

      Object.keys(newForm).forEach(key => {
        if (key.indexOf(`${id}-option`) > -1) {
          if (newForm[id]?.value) {
            newForm[id].value = `${newForm[id].value}${
              newForm[key].value ? '-' + newForm[key].value : '-'
            }`
          }
          delete newForm[key]
        }
      })

      id = dialog.form.find(form => form.name === 'Chest wall').valueId

      Object.keys(newForm).forEach(key => {
        if (key.indexOf(`${id}-option`) > -1) {
          if (newForm[id]?.value) {
            newForm[id].value = `${newForm[id].value}${
              newForm[key].value ? '-' + newForm[key].value : '-'
            }`
          }
          delete newForm[key]
        }
      })

      Object.keys(newForm)
        .filter(key => key.indexOf(`-option`) > -1)
        .forEach(key => {
          delete newForm[key]
        })
    }

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
    // console.log(newForm)
    // return
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
            titleName='Thorax'
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
                    {CheckBox(dialog.form[0], 310)}
                    <div
                      ref={section1}
                      style={{
                        ...flexCenter,
                        width: 500,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[0].valueId}-option-1`,
                          dialog.form[0].content.split('-')[1] || '',
                          option1
                        )}

                        {InputText(
                          dialog.form[0],
                          `${dialog.form[0].valueId}-option-2`,
                          dialog.form[0].content.split('-')[2] || ''
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[1], 310)}
                    <div
                      ref={section2}
                      style={{
                        ...flexCenter,
                        width: 600,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[1].valueId}-option-1`,
                          dialog.form[1].content.split('-')[1] || '',
                          option1
                        )}
                        {SelectOption(
                          `${dialog.form[1].valueId}-option-2`,
                          dialog.form[1].content.split('-')[2] || '',
                          option2
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[2], 310)}
                    <div
                      ref={section3}
                      style={{
                        ...flexCenter,
                        width: 600,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[2].valueId}-option-1`,
                          dialog.form[2].content.split('-')[1] || '',
                          option1
                        )}

                        {CheckBox2(
                          'stomach',
                          `${dialog.form[2].valueId}-option-2`,
                          dialog.form[2].content.split('-')[2] || ''
                        )}
                        {CheckBox2(
                          'bowel',
                          `${dialog.form[2].valueId}-option-3`,
                          dialog.form[2].content.split('-')[3] || ''
                        )}
                        {CheckBox2(
                          'liver',
                          `${dialog.form[2].valueId}-option-4`,
                          dialog.form[2].content.split('-')[4] || ''
                        )}
                        {CheckBox2(
                          'pancreas',
                          `${dialog.form[2].valueId}-option-5`,
                          dialog.form[2].content.split('-')[5] || ''
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[3], 310)}
                    <div
                      ref={section4}
                      style={{
                        ...flexCenter,
                        width: 500,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[3].valueId}-option-1`,
                          dialog.form[3].content.split('-')[1] || '',
                          option1
                        )}
                        Degree&nbsp;
                        {SelectOption(
                          `${dialog.form[3].valueId}-option-2`,
                          dialog.form[3].content.split('-')[2] || '',
                          option3
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[4], 310)}
                    <div
                      ref={section5}
                      style={{
                        ...flexCenter,
                        width: 500,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[4].valueId}-option-1`,
                          dialog.form[4].content.split('-')[1] || '',
                          option1
                        )}

                        {SelectOption(
                          `${dialog.form[4].valueId}-option-2`,
                          dialog.form[4].content.split('-')[2] || '',
                          option4
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[5], 310)}
                    <div
                      ref={section6}
                      style={{
                        ...flexCenter,
                        width: 500,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[5].valueId}-option-1`,
                          dialog.form[5].content.split('-')[1] || '',
                          option1
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      ...flexCenter,
                      marginTop: 9,
                      width: 720,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ width: 180 }}>Thorax Diameter(T)</div>
                    <div style={{ ...flexCenter, width: 170 }}>
                      {InputText(
                        dialog.form[6],
                        `${dialog.form[6].valueId}`,
                        dialog.form[6].content
                      )}
                    </div>

                    <div style={{ width: 110 }}>Thorax circ</div>
                    <div style={{ ...flexCenter, width: 200 }}>
                      {InputText(
                        dialog.form[8],
                        `${dialog.form[8].valueId}`,
                        dialog.form[8].content
                      )}
                    </div>

                    <div style={{ width: 180, marginTop: 9 }}>
                      Thorax Diameter(A-P)
                    </div>
                    <div style={{ ...flexCenter, width: 170, marginTop: 9 }}>
                      {InputText(
                        dialog.form[7],
                        `${dialog.form[7].valueId}`,
                        dialog.form[7].content
                      )}
                    </div>

                    <div style={{ width: 110, marginTop: 9 }}>TC/AC</div>
                    <div style={{ ...flexCenter, width: 200, marginTop: 9 }}>
                      {InputText(
                        dialog.form[9],
                        `${dialog.form[9].valueId}`,
                        dialog.form[9].content
                      )}
                    </div>

                    <div style={{ width: 180, marginTop: 9 }}>
                      Lung Diameter
                    </div>
                    <div style={{ ...flexCenter, width: 160, marginTop: 9 }}>
                      {InputText(
                        dialog.form[10],
                        `${dialog.form[10].valueId}`,
                        dialog.form[10].content
                      )}{' '}
                      left
                    </div>
                    <div style={{ ...flexCenter, width: 200, marginTop: 9 }}>
                      {InputText(
                        dialog.form[11],
                        `${dialog.form[11].valueId}`,
                        dialog.form[11].content
                      )}{' '}
                      right
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    <div style={{ width: 180 }}>Chest Wall</div>
                    <div
                      style={{
                        ...flexCenter,
                        width: 600,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        <input
                          type='checkbox'
                          name={dialog.form[12].valueId}
                          defaultChecked={true}
                          style={{ display: 'none' }}
                          data-value={dialog.form[12].name}
                          data-name={dialog.form[12].valueId}
                        />
                        {CheckBox2(
                          'Short barrel shaped',
                          `${dialog.form[12].valueId}-option-1`,
                          dialog.form[12].content.split('-')[1] || ''
                        )}
                        {CheckBox2(
                          'Long narrow',
                          `${dialog.form[12].valueId}-option-2`,
                          dialog.form[12].content.split('-')[2] || ''
                        )}
                        {CheckBox2(
                          'Narrow pear shaped',
                          `${dialog.form[12].valueId}-option-3`,
                          dialog.form[12].content.split('-')[3] || ''
                        )}
                        {CheckBox2(
                          'Rib fractures ',
                          `${dialog.form[12].valueId}-option-4`,
                          dialog.form[12].content.split('-')[4] || ''
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    <div style={{ width: 180 }}>Mediastinal Shift</div>
                    <div
                      style={{
                        ...flexCenter,
                        width: 500,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        // border: '1px solid white',
                      }}
                    >
                      <div style={flexCenter}>
                        {SelectOption(
                          `${dialog.form[13].valueId}`,
                          dialog.form[13].content,
                          option5
                        )}
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
