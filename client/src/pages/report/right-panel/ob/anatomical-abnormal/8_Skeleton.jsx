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
import { DialogActions } from '@mui/material'

const flexCenter = { display: 'flex', alignItems: 'center' }

const option1 = ['Type 1A', 'Type 1B', 'Type 2']
const option2 = [
  'Type I',
  'Type II',
  'Type III',
  'Type IV',
  'Type V',
  'Type VI',
  'Type VII',
  'Type VIII',
]

const lastCheckBox = [
  'Intrauterine Fractures',
  'Skeletal Shortening',
  'Thanatophoric Dwarfism',
  'Camptomelic Dysplasia',
  'Short Rib Short Limb Syndrome',
  'Ellis Van Crefeld Syndrome',
  'Chondrodystrophic Dystrophy',
  'Arthrogryposis Multiplex Congenita',
]

let rowValueId = []
let rowContent = {}

function Details({ dialog, setOpen, setSnackWarning }) {
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
            defaultChecked={content !== ''}
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

  const [dialogWidth, setDialogWidth] = useState(920)
  const modifiedContentRef = useRef(null)
  const notVisibleRef = useRef(null)
  const formRef = useRef(null)

  const section1 = useRef(null)
  const section2 = useRef(null)

  const formNameMap = {
    Achondrogenesis: section1,
    'Osteogenesis Imperfecta': section2,
  }

  const nameArr = Object.keys(formNameMap).map(key => key)

  const memberArr = [['Achondrogenesis'], ['Osteogenesis Imperfecta']]

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 770)
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
        // console.log(newForm)
        Object.keys(rowContent).forEach(key => {
          if (newForm[key]?.value) {
            let data = ''

            let member = []
            rowContent[key].forEach(valueId => {
              if (newForm[valueId]?.value) {
                let val = newForm[valueId].value.split('-')

                if (val[0] && val[1]) {
                  let colon = ''
                  let v = ` (${val[1]})`
                  if (rowContent[key].length === 1) {
                    colon = ':'
                    v = ` ${val[1]}`
                  }

                  val = capitalizeSentence(val[0]) + colon + v
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
          if (lastCheckBox.includes(newForm[key]?.value))
            lastArr.push(newForm[key].value)
        })

        if (lastArr.length > 0) {
          contentArr.push(lastArr.join(', '))
        }

        modifiedContentRef.current.value = contentArr.join(`\n`)
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[11].valueId
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

    let modifyId = dialog.form[10].valueId
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
            }}
          >
            <form autoComplete='off' ref={formRef}>
              {['Abnormal', 'Details'].includes(dialog.type) ? (
                <>
                  <div style={flexCenter}>
                    {CheckBox(dialog.form[3], 230)}
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
                      <>
                        {SelectOption(
                          `${dialog.form[3].valueId}-option-1`,
                          dialog.form[3].content.split('-')[1] || '',
                          option1
                        )}
                      </>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    {CheckBox(dialog.form[4], 230)}
                    <div
                      ref={section2}
                      style={{
                        ...flexCenter,
                        width: 500,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        display: 'none',
                        // border: '1px solid white',
                      }}
                    >
                      <>
                        {SelectOption(
                          `${dialog.form[4].valueId}-option-1`,
                          dialog.form[4].content.split('-')[1] || '',
                          option2
                        )}
                      </>
                    </div>
                  </div>

                  <div style={{ ...flexCenter, marginTop: 9 }}>
                    <div
                      style={{
                        ...flexCenter,
                        width: 740,
                        flexWrap: 'wrap',
                        rowGap: 11,
                        // border: '1px solid white',
                      }}
                    >
                      {CheckBox(dialog.form[0], 310)}
                      {CheckBox(dialog.form[1], 300)}
                      {CheckBox(dialog.form[2], 310)}
                      {CheckBox(dialog.form[5], 300)}
                      {CheckBox(dialog.form[6], 310)}
                      {CheckBox(dialog.form[7], 300)}
                      {CheckBox(dialog.form[8], 310)}
                      {CheckBox(dialog.form[9], 300)}
                    </div>
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[11].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[11])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[10]}
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
