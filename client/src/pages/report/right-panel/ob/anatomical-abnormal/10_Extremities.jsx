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
import { Box, DialogActions } from '@mui/material'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'

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

const Accordion = styled(props => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const AccordionSummary = styled(props => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

const bgcolorStyle = {
  bgcolor: theme => (theme.palette.mode === 'dark' ? '#393939' : '#f9f9f9'),
}
const bgcolorStyleH = {
  bgcolor: theme => (theme.palette.mode === 'dark' ? '#202020' : '#eef6f5'),
}

const flexCenter = { display: 'flex', alignItems: 'center' }

const option = ['Left', 'Right', 'Bilateral']

const modifiedContent = {
  Feet: [434, 443],
  Humerus: [444, 447],
  Radius: [448, 451],
  Tibia: [452, 455],
  Elbows: [456, 459],
  Wrists: [460, 463],
  Knees: [464, 467],
  Ankles: [468, 468],
  Hands: [469, 478],
  Femur: [479, 482],
  Ulna: [483, 486],
  Fibula: [487, 490],
}

const leftSide = ['Feet', 'Humerus', 'Radius', 'Tibia', 'Joints']
const rightSide = ['Hands', 'Femur', 'Ulna', 'Fibula']

const defaultBadge = {}
let tempBadge = {}

Object.keys(modifiedContent).forEach((key, i) => {
  if (i === 4) defaultBadge['Joints'] = 0
  else if (i < 4 || i > 7) defaultBadge[key] = 0
})

function Details({ dialog, setOpen, setSnackWarning }) {
  const SelectOption = (form, options = [], width = 120) => {
    let val = form.content.split('-')[1] || ''
    let valueId = `${form.valueId}-option-1`

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
    let { valueId, name, display, content } = form
    let label = display

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

  const [expanded1, setExpanded1] = useState('')
  const [expanded2, setExpanded2] = useState('')
  const [alertBadge, setAlertBadge] = useState(defaultBadge)

  const handleChangeAccordion1 = panel => (event, newExpanded) => {
    setExpanded1(newExpanded ? panel : false)
  }

  const handleChangeAccordion2 = panel => (event, newExpanded) => {
    setExpanded2(newExpanded ? panel : false)
  }

  const [dialogWidth, setDialogWidth] = useState(800)
  const modifiedContentRef = useRef(null)
  const notVisibleRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (dialog?.form) {
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 800)
      // console.log(dialog.form)
      // console.log(defaultBadge)

      setTimeout(() => {
        Object.keys(defaultBadge).forEach(key => {
          tempBadge[key] = dialog.form.filter(
            form => form.name.split('-')[0] === key && form.content !== ''
          ).length
        })
        setAlertBadge(tempBadge)
      }, 50)
    }

    return () => {
      setExpanded1('')
      setExpanded2('')
      setAlertBadge(defaultBadge)
    }
  }, [dialog])

  function handleSetBadge(data, name) {
    let count = 0
    let start = 0
    let end = 0

    if (name === 'Joints') {
      start = 456
      end = 468
    } else {
      start = modifiedContent[name][0]
      end = modifiedContent[name][1]
    }

    Object.keys(data)
      .filter(
        key =>
          key.indexOf('-option') === -1 &&
          parseInt(key) >= start &&
          parseInt(key) <= end
      )
      .forEach(key => {
        if (data[key]?.value) count++
      })

    setAlertBadge(prev => ({
      ...prev,
      [name]: count,
    }))
  }

  function handleChange(e, form) {
    const { value, name } = e.target

    if (form && form.name === 'Reason') {
      modifiedContentRef.current.value = value || ''
    } else {
      setTimeout(() => {
        let contentArr = []
        const data = qsa(['input', 'select', 'checkbox'], formRef.current)
        let newForm = formDataToObject2(data)

        Object.keys(modifiedContent).forEach(key => {
          let masterName = key
          let start = modifiedContent[key][0]
          let end = modifiedContent[key][1]
          let arr = []
          let keyArr = Object.keys(newForm)
            .filter(
              key =>
                parseInt(key.split('-')[0]) >= start &&
                parseInt(key.split('-')[0]) <= end &&
                key.indexOf('-option') === -1
            )
            .map(key => parseInt(key))

          keyArr.forEach(key => {
            if (newForm[key]?.value) {
              let value = newForm[key].value.split('-')
              arr.push(`${value[0]}${value.length > 1 ? ` (${value[1]})` : ''}`)
            }
          })

          if (arr.length > 0)
            contentArr.push(`${masterName}: ${arr.join(', ')}`)
        })

        modifiedContentRef.current.value = contentArr.join(`\n`)

        handleSetBadge(newForm, newForm[name].name.split('-')[0])
      }, 100)
    }
  }

  async function handleSave() {
    let newForm = {}

    if (dialog.type === 'Not Visible') {
      let reasonId = dialog.form[58].valueId
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

    let modifyId = dialog.form[57].valueId
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
            titleName='Extremities'
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
                  <Box
                    sx={{
                      display: 'flex',
                      columnGap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: '50%',
                      }}
                    >
                      <div>
                        {leftSide.map((name, index) => {
                          // console.log(name)
                          let start = 0
                          let end = 0
                          if (index === 4) {
                            start = 456
                            end = 468
                          } else {
                            start = modifiedContent[name][0]
                            end = modifiedContent[name][1]
                          }

                          return (
                            <div key={index}>
                              <Accordion
                                expanded={expanded1 === name}
                                onChange={handleChangeAccordion1(name)}
                              >
                                <AccordionSummary sx={bgcolorStyleH}>
                                  <Badge
                                    badgeContent={alertBadge[name]}
                                    color='warning'
                                  >
                                    <Typography sx={{ mr: 1 }}>
                                      {name}
                                    </Typography>
                                  </Badge>
                                </AccordionSummary>
                                <AccordionDetails sx={bgcolorStyle}>
                                  {dialog.form
                                    .filter(
                                      form =>
                                        form.valueId >= start &&
                                        form.valueId <= end
                                    )
                                    .map((form, index) => {
                                      let margin = { marginTop: 5 }
                                      if (index === 0) margin = {}
                                      return (
                                        <div
                                          key={index}
                                          style={{ ...flexCenter, ...margin }}
                                        >
                                          {CheckBox(form)}
                                          {SelectOption(form, option)}
                                        </div>
                                      )
                                    })}
                                </AccordionDetails>
                              </Accordion>
                            </div>
                          )
                        })}
                      </div>
                    </Box>
                    <Box
                      sx={{
                        width: '50%',
                      }}
                    >
                      <div>
                        {rightSide.map((name, index) => {
                          let start = modifiedContent[name][0]
                          let end = modifiedContent[name][1]

                          return (
                            <div key={index}>
                              <Accordion
                                expanded={expanded2 === name}
                                onChange={handleChangeAccordion2(name)}
                              >
                                <AccordionSummary sx={bgcolorStyleH}>
                                  <Badge
                                    badgeContent={alertBadge[name]}
                                    color='warning'
                                  >
                                    <Typography sx={{ mr: 1 }}>
                                      {name}
                                    </Typography>
                                  </Badge>
                                </AccordionSummary>
                                <AccordionDetails sx={bgcolorStyle}>
                                  {dialog.form
                                    .filter(
                                      form =>
                                        form.valueId >= start &&
                                        form.valueId <= end
                                    )
                                    .map((form, index) => {
                                      let margin = { marginTop: 5 }
                                      if (index === 0) margin = {}
                                      return (
                                        <div
                                          key={index}
                                          style={{ ...flexCenter, ...margin }}
                                        >
                                          {CheckBox(form)}
                                          {SelectOption(form, option)}
                                        </div>
                                      )
                                    })}
                                </AccordionDetails>
                              </Accordion>
                            </div>
                          )
                        })}
                      </div>
                    </Box>
                  </Box>
                </>
              ) : (
                <NotVisibleForm
                  inputRef={notVisibleRef}
                  defaultValue={dialog.form[58].content || ''}
                  width={dialogWidth - 26}
                  handleChange={e => handleChange(e, dialog.form[58])}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[57]}
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
