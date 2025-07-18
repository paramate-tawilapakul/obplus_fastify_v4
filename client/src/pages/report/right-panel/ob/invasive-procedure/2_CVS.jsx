import { useEffect } from 'react'
import axios from 'axios'
import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Divider } from '@mui/material'

import SelectField from '../../../../../components/page-tools/SelectField'
import InputTextField from '../../../../../components/page-tools/InputTextField'
import CommentField from '../../../../../components/page-tools/CommentField'

import {
  btStyle,
  inputMargin,
} from '../../../../../components/page-tools/form-style'
import {
  autoSave2,
  cleanUpForm,
  updateProcedureDataChange,
} from '../../../helper'
import { storeBackupData3 } from '../../../report-utils'
import { API, STORAGE_NAME } from '../../../../../config'

const option1 = [
  {
    name: 'Karyotype',
    width: 115,
  },
  {
    name: 'PCR',
    width: 75,
  },
  {
    name: 'QFPCR for aneuploidy',
    width: 205,
  },
  {
    name: 'Beta Thalassemia',
    width: 200,
  },
  {
    name: 'Alpha Thalassemia',
    width: 190,
  },
  {
    name: 'Microarrays',
    width: 130,
  },
  {
    name: 'TORCH titer',
    width: 130,
  },
  {
    name: 'Other',
    width: 80,
  },
]

const option2 = [
  {
    name: 'Rest',
    width: 75,
  },
  {
    name: 'Avoid coitus',
    width: 135,
  },
  {
    name: 'Serious symptoms',
    width: 170,
  },
]

function CVS({
  form,
  handleChange,
  showUterusText,
  showInstrumentText,
  setSnackWarning,
  amnioticRef,
  complicationRef,
  setDataFormSend,
  manageFreeText,
}) {
  const CheckBox = (form, width = 200) => {
    let { cname } = form
    let content = form.content
    if (form.name === 'CVS sampling tissue test for') {
      // console.log('name', cname)
      if (cname === 'PCR') {
        content = content.split(', ')

        // console.log('content', content)
      }
    }

    return (
      <div style={{ display: 'inline' }} key={cname}>
        <FormControlLabel
          control={
            <Checkbox
              name={cname}
              defaultChecked={content.indexOf(cname) > -1}
              sx={{
                p: 0.5,
              }}
              onChange={e => handleChange(e, { ...form, cname })}
            />
          }
          label={cname}
          sx={{
            m: 0,
            width,
          }}
        />

        {cname === 'Other' && (
          <InputTextField
            inputRef={amnioticRef}
            value={form.content?.split('Other> ')[1]?.split(',')[0] || ''}
            handleChange={e => {
              updateProcedureDataChange('1')

              setDataFormSend(prev => {
                let temp = {
                  ...prev,
                  [form.valueId]: {
                    ...prev[form.valueId],
                    value: manageFreeText(
                      e.target.value,
                      prev[form.valueId].value,
                      'Other>'
                    ),
                  },
                }
                storeBackupData3(temp, 'CVS')
                // console.log(temp)
                return temp
              })
            }}
            form={{ ...form, name: '' }}
            width={150}
            sx={{ ml: 1 }}
            paddingLeft={5}
          />
        )}
      </div>
    )
  }

  useEffect(() => {
    return () => {
      let d = window.localStorage.getItem(STORAGE_NAME.CVS)
      if (d) autoSave2(JSON.parse(d))
    }
  }, [])

  async function saveData() {
    try {
      let data = JSON.parse(
        window.localStorage.getItem(STORAGE_NAME.lastActiveTabData3)
      )
      // console.log(data)
      let newForm = cleanUpForm(data)
      /// SAVE TO STORAGE FOR AUTO SAVE BEFORE PREVIEW
      storeBackupData3(data, 'CVS')

      const res = await axios.post(API.REPORT_CONTENT, { reportData: newForm })
      let message = 'Save Fail!'
      let severity = 'error'

      if (res.data.data) {
        message = 'Save Completed'
        severity = 'success'
        updateProcedureDataChange('0')
      }

      setSnackWarning(prev => ({
        ...prev,
        show: true,
        message,
        severity,
      }))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Box sx={{ m: inputMargin }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SelectField
            value={form[0].contentOption || ''}
            handleChange={e => handleChange(e, form[0])}
            form={form[0]}
          />
          {showUterusText && (
            <InputTextField
              value={form[1].content}
              handleChange={e => handleChange(e, form[1])}
              form={{ ...form[1], name: '' }}
              sx={{ ml: 1, mt: 0.5 }}
              width={322}
            />
          )}
        </div>
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[2].contentOption || ''}
          handleChange={e => handleChange(e, form[2])}
          form={form[2]}
        />
      </Box>

      <Box sx={{ m: inputMargin }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SelectField
            value={form[3].contentOption || ''}
            handleChange={e => handleChange(e, form[3])}
            form={form[3]}
          />
          {showInstrumentText && (
            <InputTextField
              value={form[4].content}
              handleChange={e => handleChange(e, form[4])}
              form={{ ...form[4], name: '' }}
              sx={{ ml: 1, mt: 0.5 }}
              width={322}
            />
          )}
        </div>
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[5].contentOption || ''}
          handleChange={e => handleChange(e, form[5])}
          form={form[5]}
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[6].contentOption || ''}
          handleChange={e => handleChange(e, form[6])}
          form={form[6]}
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <InputTextField
          value={form[7].content?.split(' ')[0] || ''}
          handleChange={e => handleChange(e, form[7])}
          form={form[7]}
          endAdornment={
            <InputAdornment position='end'>
              <div>{form[7].unit}</div>
            </InputAdornment>
          }
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <InputTextField
          value={form[8].content?.split(' ')[0] || ''}
          handleChange={e => handleChange(e, form[8])}
          form={form[8]}
          endAdornment={
            <InputAdornment position='end'>
              <div>{form[8].unit}</div>
            </InputAdornment>
          }
        />
      </Box>

      <Box sx={{ m: inputMargin, width: '100%' }}>
        <div>{form[9].name}</div>
        {option1.map(option =>
          CheckBox({ ...form[9], cname: option.name }, option.width)
        )}
      </Box>

      <Box sx={{ m: inputMargin, width: '92%' }}>
        <Divider />
      </Box>
      <Box sx={{ m: inputMargin, width: '100%' }}>
        <SelectField
          value={form[10]?.contentOption || ''}
          handleChange={e => handleChange(e, form[10])}
          form={form[10]}
        />
        <InputTextField
          placeholder='Define...'
          inputRef={complicationRef}
          value={form[11].content}
          // handleChange={e => handleChange(e, form[11])}
          handleChange={e => {
            updateProcedureDataChange('1')

            setDataFormSend(prev => {
              let temp = {
                ...prev,
                [form[11].valueId]: {
                  ...prev[form[11].valueId],
                  value: e.target.value,
                  type: 'T',
                },
              }
              storeBackupData3(temp, 'CVS')
              // console.log(temp)
              return temp
            })
          }}
          form={{ ...form[11], name: '' }}
          sx={{ ml: 1 }}
          width={350}
        />
      </Box>
      <Box sx={{ m: inputMargin, width: '100%' }}>
        <div>{form[12].name}</div>
        {option2.map(option =>
          CheckBox({ ...form[12], cname: option.name }, option.width)
        )}
      </Box>
      <Box sx={{ m: inputMargin, width: '92%' }}>
        <Divider />
      </Box>

      <Box sx={{ m: inputMargin, width: '100%' }}>
        <CommentField
          minWidth={418}
          value={form[13].content}
          handleChange={e => handleChange(e, form[13])}
          form={form[13]}
          //  handleChange={e => handleChange(e, form)}
        />
      </Box>

      <Button
        sx={{ ...btStyle, m: inputMargin }}
        variant='contained'
        startIcon={<CheckIcon />}
        onClick={() => saveData()}
      >
        Save
      </Button>
    </>
  )
}

export default CVS
