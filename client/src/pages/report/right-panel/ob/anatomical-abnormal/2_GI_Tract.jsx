import { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import {
  btStyle,
  inputStyle,
  dialogContentBgColor,
} from '../../../../../components/page-tools/form-style'
import { API, MODE } from '../../../../../config'
import { cleanUpForm } from '../../../helper'
import { onlyHasValueArray } from '../../../../../utils'
import DialogTitle from '../components/BoxTitle'
import NotVisibleForm from '../components/NotVisibleForm'
import ModifiedContent from '../components/ModifiedContent'

const excludeCystsArr = [
  'liver cyst',
  'mesenterial cyst',
  'l.renal cyst',
  'r.renal cyst',
  'l.ovarian cyst',
  'r.ovarian cyst',
  'choledochus cyst',
  'unknown origin',
]

const lastCheckBox = [
  'double bubble',
  'small bowel obstruction',
  'large bowel obstruction',
  'situs inversus',
  'stomach not visible',
  'stomach collapsed',
  'stomach dilated',
  'hepatomegaly',
  'splenomegaly',
]

const option1 = ['Mild', 'Moderate', 'Severe']

function Details({ dialog, setOpen, setSnackWarning }) {
  const modifiedContentRef = useRef(null)
  const [dialogWidth, setDialogWidth] = useState(920)
  const [showAscites, setShowAscites] = useState(false)
  const [showCysts, setShowCysts] = useState(false)
  const [showHyper, setShowHyper] = useState(false)
  const [showLiver, setShowLiver] = useState(false)
  const [ascitesData, setAscitesData] = useState(['', '', ''])
  const [largestCystData, setLargestCystData] = useState(['', '', ''])
  const [liverNoduleData, setLiverNoduleData] = useState(['', '', '', ''])
  const [hyperData, setHyperData] = useState(['', ''])

  useEffect(() => {
    if (dialog?.form) {
      //   console.log('form', dialog.form)
      setDialogWidth(dialog.type === 'Not Visible' ? 500 : 920)

      let ascites = dialog.form[0].content
      if (ascites) {
        let t = ascites.split('-')
        if (t[0]) {
          setShowAscites(true)
          let d1 = t[0] || ''
          let d2 = t[1] || ''
          let d3 = t[2]?.split(' ')[1] || ''
          setAscitesData([d1, d2, d3])
        }
      }

      if (dialog.form[1].content) {
        setShowCysts(true)
      }

      let largestCyst = dialog.form[10].content
      if (largestCyst) {
        let t = largestCyst.split('x')
        let d1 = t[0] || ''
        let d2 = t[1] || ''
        let d3 = t[2]?.split(' ')[0] || ''
        setLargestCystData([d1, d2, d3])
      }

      let hyper = dialog.form[12].content
      if (hyper) {
        setShowHyper(true)
        let t = hyper.split('-')
        let d1 = t[0] || ''
        let d2 = t[1] || ''
        setHyperData([d1, d2])
      }

      let liverNodule = dialog.form[14].content
      if (liverNodule) {
        let t = liverNodule.split('-')
        if (t[0]) {
          let l = t[1].split('x')

          setShowLiver(true)
          let d1 = l[0] || ''
          let d2 = l[1] || ''
          let d3 = l[2]?.split(' ')[0] || ''
          setLiverNoduleData([t[0], d1, d2, d3])
        }
      }

      // console.log('formSend', dialog.formSend)
    }

    return () => {
      setShowAscites(false)
      setShowCysts(false)
      setShowHyper(false)
      setShowLiver(false)
      setAscitesData(['', '', ''])
      setLargestCystData(['', '', ''])
      setLiverNoduleData(['', '', '', ''])
      setHyperData(['', ''])
    }
  }, [dialog])

  async function handleSave() {
    if (ascitesData[0]) {
      if (!ascitesData[1]) {
        return alert('Please select Ascites option')
      }

      if (!ascitesData[2]) {
        return alert('Please fill in Ascites quantity')
      }
    }

    if (
      //if has largest cyst > all input must contain data
      largestCystData.some(d => d !== '') &&
      largestCystData.some(d => d === '')
    ) {
      return alert('Please fill in Largest Cyst Measurement')
    }

    if (hyperData[0]) {
      if (!hyperData[1]) {
        return alert('Please select Hyperechogenic Bowel option')
      }
    }

    if (liverNoduleData[0]) {
      if (liverNoduleData.some(d => d === '')) {
        return alert('Please fill in Liver Nodule Measurement')
      }
    }

    // console.log('pass', dialog.formSend)

    let newForm = { ...dialog.formSend }

    // if (modifiedContentRef.current.value) {
    let modifyId = dialog.form[23].valueId
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
      let reasonId = dialog.form[24].valueId
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

  async function handleChange(e, form, position) {
    let value = e.target.value

    if (form.name === 'Ascites') {
      if (position === 0 && !e.target.checked) {
        setAscitesData(['', '', ''])
        value = ''
      } else {
        let t = [...ascitesData]

        if (position === 0) t[0] = form.name
        else t[position] = value.trim()

        let t2 = [...t]

        if (t[2]) t[2] = `Quantity ${t[2]} mm`

        value = t.join('-')

        setAscitesData(t2)
      }
    } else if (form.name === 'Cysts') {
      if (!e.target.checked) {
        value = ''

        dialog.form = dialog.form.map(form => {
          if (excludeCystsArr.includes(form.name.toLowerCase())) {
            return { ...form, content: '' }
          }

          return form
        })

        // console.log(dialog.formSend)
        Object.keys(dialog.formSend).forEach(key => {
          if (
            excludeCystsArr.includes(dialog.formSend[key]?.value?.toLowerCase())
          ) {
            delete dialog.formSend[key]
          }
        })

        let lgCystId = dialog.form[10].valueId
        delete dialog.formSend[lgCystId]
        setLargestCystData(['', '', ''])
      } else {
        value = form.name
      }
    } else if (form.name === 'Largest cyst') {
      let t = [...largestCystData]

      t[position] = value.trim()

      let t2 = [...t]

      if (t[2]) t[2] = `${t[2]} mm`

      value = t.join('x')

      if (value === 'xx') {
        value = ''
      }

      setLargestCystData(t2)
    } else if (form.name === 'Hyperechogenic Bowel') {
      if (position === 0 && !e.target.checked) {
        setHyperData(['', ''])
        let valueName = 'Evidence of bleeding in amniotic fluid'
        dialog.form = dialog.form.map(form => {
          if (form.name === valueName) {
            return { ...form, content: '' }
          }

          return form
        })

        let evidenceId = dialog.form[13].valueId
        delete dialog.formSend[evidenceId]
        value = ''
      } else {
        let t = [...hyperData]

        if (position === 0) t[0] = form.name
        else t[position] = value

        let t2 = [...t]

        value = t.join('-')

        setHyperData(t2)
      }
    } else if (form.name === 'Liver Nodule') {
      if (position === 0 && !e.target.checked) {
        setLiverNoduleData(['', '', '', ''])
        // let valueName = 'Liver Nodule'

        let liverNoduleId = dialog.form[14].valueId
        delete dialog.formSend[liverNoduleId]
        value = ''
      } else {
        let t = [...liverNoduleData]

        if (position === 0) t[0] = form.name
        else t[position] = value

        let t2 = [...t]

        if (t[3]) t[3] = `${t[3]} mm`

        let mes = t.slice(1).join('x')

        value = t[0] + '-' + mes

        setLiverNoduleData(t2)
      }
    } else if (form.type === 'C') {
      value = ''
      if (e.target.checked) value = form.newValue || form.name
    }

    // console.log('value', value)

    dialog.formSend = {
      ...dialog.formSend,
      [form.valueId]: { type: form.type, value },
    }

    // console.log('formSend', dialog.formSend)
    if (dialog.type === 'Not Visible') {
      modifiedContentRef.current.value = value
    } else {
      let contentArr = []
      let content1 = ''
      let c1 = dialog.formSend[dialog.form[0].valueId]?.value?.split('-')
      if (c1 && c1[0]) {
        let arr = [c1[1], c1[2]].filter(onlyHasValueArray)
        content1 = `${c1[0]}: ${arr.join(', ')}`
        contentArr.push(content1)
      }

      let content2 = ''
      let c2 = dialog.formSend[dialog.form[1].valueId]?.value
      if (c2) {
        content2 = `${c2}: `
        let cystArr = []
        Object.keys(dialog.formSend).forEach(key => {
          if (
            excludeCystsArr.includes(dialog.formSend[key]?.value?.toLowerCase())
          ) {
            cystArr.push(dialog.formSend[key].value)
          }
        })

        let largestCyst = dialog.formSend[dialog.form[10].valueId]?.value

        if (largestCyst) cystArr.push('Largest Cyst: ' + largestCyst)

        content2 += cystArr.join(', ')
        contentArr.push(content2)
      }

      let content3 = ''
      let c3 = dialog.formSend[dialog.form[12].valueId]?.value?.split('-')

      if (c3 && c3[0]) {
        let arr = [c3[1], dialog.formSend[dialog.form[13].valueId]?.value]
        arr = arr.filter(onlyHasValueArray)

        content3 = `${c3[0]}: ${arr.join(', ')}`
        contentArr.push(content3)
      }

      let content4 = ''
      let c4 = dialog.formSend[dialog.form[14].valueId]?.value?.split('-')
      if (c4 && c4[0]) {
        content4 = `${c4[0]}: ${c4[1]}`
        contentArr.push(content4)
      }

      // let content5 = ''

      let lastArr = []
      Object.keys(dialog.formSend).forEach(key => {
        if (lastCheckBox.includes(dialog.formSend[key]?.value?.toLowerCase())) {
          // lastArr.push(dialog.formSend[key].value)
          lastArr.push(dialog.formSend[key].value)
        }
      })

      contentArr.push(lastArr.join(', '))
      // content5 = lastArr.join(', ')

      // let modifyContent = [
      //   content1,
      //   content2,
      //   content3,
      //   content4,
      //   content5,
      // ].join(`\n`)
      // console.log(contentArr)
      let modifyContent = contentArr.join(`\n`)
      modifiedContentRef.current.value = modifyContent.trim()
    }
  }

  function handleClose() {
    setOpen({})
  }

  return (
    <>
      {dialog?.form && (
        <Dialog open={dialog.open} onClose={handleClose} maxWidth={'lg'}>
          <DialogTitle
            titleName='GI Tract'
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={ascitesData[0] !== ''}
                          onChange={e => {
                            if (e.target.checked) setShowAscites(true)
                            else setShowAscites(false)

                            handleChange(e, dialog.form[0], 0)
                          }}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Ascites'
                      sx={{ m: 0, width: 220 }}
                    />

                    {showAscites && (
                      <>
                        <FormControl
                          size='small'
                          sx={{ ...inputStyle, width: 120, mr: 3 }}
                        >
                          <Select
                            size='small'
                            variant='outlined'
                            notched
                            sx={{
                              fontSize: 16,
                              p: 0,
                              color: theme =>
                                MODE[theme.palette.mode].dataGrid.font,
                            }}
                            value={ascitesData[1]}
                            onChange={e => handleChange(e, dialog.form[0], 1)}
                          >
                            <MenuItem value=''></MenuItem>
                            {option1.map(option => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <div>Quantity</div>
                        <TextField
                          size='small'
                          variant='outlined'
                          inputProps={{
                            style: {
                              textAlign: 'right',
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            ml: 1,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          value={ascitesData[2]}
                          onChange={e => handleChange(e, dialog.form[0], 2)}
                        />
                        &nbsp; mm
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: 7,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[1].content !== ''}
                          onChange={e => {
                            if (e.target.checked) setShowCysts(true)
                            else setShowCysts(false)

                            handleChange(e, dialog.form[1])
                          }}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Cysts'
                      sx={{ m: 0, mt: showCysts ? -2 : 0, width: 430 }}
                    />
                    {showCysts && (
                      <div>
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[2].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[2],
                                  newValue: 'Liver Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='Liver Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[4].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[4],
                                  newValue: 'Mesenterial Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='Mesenterial Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[6].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[6],
                                  newValue: 'L.Ovarian Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='L.Ovarian Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[8].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[8],
                                  newValue: 'R.Ovarian Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='R.Ovarian Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[3].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[3],
                                  newValue: 'Choledochus Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='Choledochus Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[5].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[5],
                                  newValue: 'L.Renal Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='L.Renal Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[7].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[7],
                                  newValue: 'R.Renal Cyst',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='R.Renal Cyst'
                          sx={{ m: 0, width: 170 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[9].content !== ''}
                              onChange={e =>
                                handleChange(e, {
                                  ...dialog.form[9],
                                  newValue: 'Unknown Origin',
                                })
                              }
                              sx={{ p: 0.5 }}
                            />
                          }
                          label='Unknown Origin'
                          sx={{ m: 0, width: 170 }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: 8,
                          }}
                        >
                          Largest Cyst:
                          <TextField
                            size='small'
                            variant='outlined'
                            inputProps={{
                              style: {
                                textAlign: 'right',
                              },
                            }}
                            sx={{
                              ...inputStyle,
                              ml: 1,
                              width: 60,
                              backgroundColor: theme =>
                                theme.palette.mode === 'light'
                                  ? 'white'
                                  : '#393939',
                            }}
                            value={largestCystData[0]}
                            onChange={e => handleChange(e, dialog.form[10], 0)}
                          />
                          X
                          <TextField
                            size='small'
                            variant='outlined'
                            inputProps={{
                              style: {
                                textAlign: 'right',
                              },
                            }}
                            sx={{
                              ...inputStyle,
                              width: 60,
                              backgroundColor: theme =>
                                theme.palette.mode === 'light'
                                  ? 'white'
                                  : '#393939',
                            }}
                            value={largestCystData[1]}
                            onChange={e => handleChange(e, dialog.form[10], 1)}
                          />
                          X
                          <TextField
                            size='small'
                            variant='outlined'
                            inputProps={{
                              style: {
                                textAlign: 'right',
                              },
                            }}
                            sx={{
                              ...inputStyle,
                              width: 60,
                              backgroundColor: theme =>
                                theme.palette.mode === 'light'
                                  ? 'white'
                                  : '#393939',
                            }}
                            value={largestCystData[2]}
                            onChange={e => handleChange(e, dialog.form[10], 2)}
                          />
                          &nbsp; mm
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: 7,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={hyperData[0] !== ''}
                          onChange={e => {
                            if (e.target.checked) setShowHyper(true)
                            else setShowHyper(false)

                            handleChange(e, dialog.form[12], 0)
                          }}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Hyperechogenic Bowel'
                      sx={{ m: 0, width: 220 }}
                    />
                    {showHyper && (
                      <div>
                        <FormControl
                          size='small'
                          sx={{ ...inputStyle, width: 120, mr: 3 }}
                        >
                          <Select
                            size='small'
                            variant='outlined'
                            notched
                            sx={{
                              fontSize: 16,
                              p: 0,
                              color: theme =>
                                MODE[theme.palette.mode].dataGrid.font,
                            }}
                            value={hyperData[1]}
                            onChange={e => handleChange(e, dialog.form[12], 1)}
                          >
                            <MenuItem value=''></MenuItem>

                            {option1.map(option => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked={dialog.form[13].content !== ''}
                              onChange={e => handleChange(e, dialog.form[13])}
                            />
                          }
                          label='Evidence of bleeding in amniotic fluid'
                          sx={{ m: 0 }}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: 7,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={liverNoduleData[0] !== ''}
                          onChange={e => {
                            if (e.target.checked) setShowLiver(true)
                            else setShowLiver(false)

                            handleChange(e, dialog.form[14], 0)
                          }}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Liver Nodule'
                      sx={{ m: 0, width: 220 }}
                    />
                    {showLiver && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          size='small'
                          variant='outlined'
                          inputProps={{
                            style: {
                              textAlign: 'right',
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            ml: 1,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          value={liverNoduleData[1]}
                          onChange={e => handleChange(e, dialog.form[14], 1)}
                        />
                        X
                        <TextField
                          size='small'
                          variant='outlined'
                          inputProps={{
                            style: {
                              textAlign: 'right',
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          value={liverNoduleData[2]}
                          onChange={e => handleChange(e, dialog.form[14], 2)}
                        />
                        X
                        <TextField
                          size='small'
                          variant='outlined'
                          inputProps={{
                            style: {
                              textAlign: 'right',
                            },
                          }}
                          sx={{
                            ...inputStyle,
                            width: 60,
                            backgroundColor: theme =>
                              theme.palette.mode === 'light'
                                ? 'white'
                                : '#393939',
                          }}
                          value={liverNoduleData[3]}
                          onChange={e => handleChange(e, dialog.form[14], 3)}
                        />
                        &nbsp; mm
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: 7,
                      width: 900,
                      flexWrap: 'wrap',
                      rowGap: 11,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[11].content !== ''}
                          onChange={e => handleChange(e, dialog.form[11])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Double Bubble'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[15].content !== ''}
                          onChange={e => handleChange(e, dialog.form[15])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Small Bowel Obstruction'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[16].content !== ''}
                          onChange={e => handleChange(e, dialog.form[16])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Large Bowel Obstruction'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[17].content !== ''}
                          onChange={e => handleChange(e, dialog.form[17])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Situs Inversus'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[18].content !== ''}
                          onChange={e => handleChange(e, dialog.form[18])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Stomach Not Visible'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[19].content !== ''}
                          onChange={e => handleChange(e, dialog.form[19])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Stomach Collapsed'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[20].content !== ''}
                          onChange={e => handleChange(e, dialog.form[20])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Stomach Dilated'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[21].content !== ''}
                          onChange={e => handleChange(e, dialog.form[21])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Hepatomegaly'
                      sx={{ m: 0, width: 220 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={dialog.form[22].content !== ''}
                          onChange={e => handleChange(e, dialog.form[22])}
                          sx={{ p: 0.5 }}
                        />
                      }
                      label='Splenomegaly'
                      sx={{ m: 0, width: 220 }}
                    />
                  </div>
                </>
              ) : (
                <NotVisibleForm
                  dataForm={dialog.form[24]}
                  handleChange={handleChange}
                  width={dialogWidth - 28}
                />
              )}

              <ModifiedContent
                inputRef={modifiedContentRef}
                dataForm={dialog.form[23]}
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
