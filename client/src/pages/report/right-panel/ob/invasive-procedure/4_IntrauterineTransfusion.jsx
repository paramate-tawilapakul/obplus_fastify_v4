import { useEffect } from 'react'

import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Divider } from '@mui/material'

import SelectField from '../../../../../components/page-tools/SelectField'
import InputTextField from '../../../../../components/page-tools/InputTextField'
import CommentField from '../../../../../components/page-tools/CommentField'

import { inputMargin } from '../../../../../components/page-tools/form-style'
import { autoSave2, updateProcedureDataChange } from '../../../helper'
import { storeBackupData3 } from '../../../report-utils'
import { STORAGE_NAME } from '../../../../../config'

const option1 = [
  { name: 'Free loop', width: 115 },
  { name: 'Placental cord insertion', width: 205 },
  { name: 'Fetal cord insertion', width: 200 },
]

const option2 = [
  { name: 'Cord vein', width: 115 },
  { name: 'Cord artery', width: 120 },
]

const option3 = [
  { name: 'Intravenous transfusion', width: 220 },
  { name: 'Intracavity transfusion', width: 210 },
  { name: 'Intraperitoneal transfusion', width: 230 },
]

const option4 = [
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

const procedureName = 'IntrauterineTransfusion'

function IntrauterineTransfusion({
  form,
  handleChange,
  showInstrumentText,
  complicationRef,
  setDataFormSend,
}) {
  const CheckBox = (form, width = 200) => {
    let { cname } = form
    let content = form.content

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
      </div>
    )
  }

  useEffect(() => {
    return () => {
      let d = window.localStorage.getItem(STORAGE_NAME.IntrauterineTransfusion)
      if (d) autoSave2(JSON.parse(d))
    }
  }, [])

  // async function saveData() {
  //   try {
  //     let data = JSON.parse(
  //       window.localStorage.getItem(STORAGE_NAME.lastActiveTabData3)
  //     )
  //     // console.log(data)
  //     let newForm = cleanUpForm(data)
  //     /// SAVE TO STORAGE FOR AUTO SAVE BEFORE PREVIEW
  //     storeBackupData3(data, procedureName)

  //     const res = await axios.post(API.REPORT_CONTENT, { reportData: newForm })
  //     let message = 'Save Fail!'
  //     let severity = 'error'

  //     if (res.data.data) {
  //       message = 'Save Completed'
  //       severity = 'success'
  //       updateProcedureDataChange('0')
  //     }

  //     setSnackWarning(prev => ({
  //       ...prev,
  //       show: true,
  //       message,
  //       severity,
  //     }))
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  return (
    <>
      <Box sx={{ m: inputMargin, width: '100%' }}>
        <div>{form[0].name}</div>
        {option1.map(option =>
          CheckBox({ ...form[0], cname: option.name }, option.width)
        )}

        <div>
          {option2.map(option =>
            CheckBox({ ...form[0], cname: option.name }, option.width)
          )}
        </div>
      </Box>
      <Box sx={{ m: inputMargin }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SelectField
            value={form[1].contentOption || ''}
            handleChange={e => handleChange(e, form[1])}
            form={form[1]}
          />
          {showInstrumentText && (
            <InputTextField
              value={form[2].content}
              handleChange={e => handleChange(e, form[2])}
              form={{ ...form[2], name: '' }}
              sx={{ ml: 1, mt: 0.5 }}
              width={322}
            />
          )}
        </div>
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[3].contentOption || ''}
          handleChange={e => handleChange(e, form[3])}
          form={form[3]}
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[4].contentOption || ''}
          handleChange={e => handleChange(e, form[4])}
          form={form[4]}
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[5].contentOption || ''}
          handleChange={e => handleChange(e, form[5])}
          form={form[5]}
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <InputTextField
          value={form[6].content?.split(' ')[0] || ''}
          handleChange={e => handleChange(e, form[6])}
          form={form[6]}
          endAdornment={
            <InputAdornment position='end'>
              <div>{form[6].unit}</div>
            </InputAdornment>
          }
        />
      </Box>
      <Box sx={{ m: inputMargin }}>
        <SelectField
          value={form[7].contentOption || ''}
          handleChange={e => handleChange(e, form[7])}
          form={form[7]}
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
      <Box sx={{ m: inputMargin, width: '92%' }}>
        <Divider />
      </Box>
      <Box sx={{ m: inputMargin, width: '100%' }}>
        <InputTextField
          value={form[9].content || ''}
          handleChange={e => handleChange(e, form[9])}
          form={form[9]}
        />
      </Box>

      <Box sx={{ m: inputMargin, width: '100%' }}>
        <div>{form[10].name}</div>
        {option3.map(option =>
          CheckBox({ ...form[10], cname: option.name }, option.width)
        )}
      </Box>
      <Box sx={{ m: inputMargin, width: '92%' }}>
        <Divider />
      </Box>
      {form.slice(11, 17).map((form, index) => (
        <Box key={index} sx={{ m: inputMargin }}>
          <InputTextField
            value={form.content?.split(' ')[0] || ''}
            handleChange={e => handleChange(e, form)}
            form={form}
            endAdornment={
              <InputAdornment position='end'>
                <div>{form.unit}</div>
              </InputAdornment>
            }
          />
        </Box>
      ))}

      <Box sx={{ m: inputMargin, width: '92%' }}>
        <Divider />
      </Box>
      <Box sx={{ m: inputMargin, width: '100%' }}>
        <SelectField
          value={form[17]?.contentOption || ''}
          handleChange={e => handleChange(e, form[17])}
          form={form[17]}
        />
        <InputTextField
          placeholder='Define...'
          inputRef={complicationRef}
          value={form[18].content}
          // handleChange={e => handleChange(e, form[18])}
          handleChange={e => {
            updateProcedureDataChange('1')

            setDataFormSend(prev => {
              let temp = {
                ...prev,
                [form[18].valueId]: {
                  ...prev[form[18].valueId],
                  value: e.target.value,
                  type: 'T',
                },
              }
              storeBackupData3(temp, procedureName)
              // console.log(temp)
              return temp
            })
          }}
          form={{ ...form[18], name: '' }}
          sx={{ ml: 1 }}
          width={350}
        />
      </Box>

      <Box sx={{ m: inputMargin, width: '100%' }}>
        <div>{form[19].name}</div>
        {option4.map(option =>
          CheckBox({ ...form[19], cname: option.name }, option.width)
        )}
      </Box>
      <Box sx={{ m: inputMargin, width: '92%' }}>
        <Divider />
      </Box>

      <Box sx={{ m: inputMargin, width: '100%' }}>
        <CommentField
          minWidth={418}
          value={form[20].content}
          handleChange={e => handleChange(e, form[20])}
          form={form[20]}
          //  handleChange={e => handleChange(e, form)}
        />
      </Box>
    </>
  )
}

export default IntrauterineTransfusion
