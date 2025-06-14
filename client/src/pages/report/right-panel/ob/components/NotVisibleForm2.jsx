import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

import { inputStyle } from '../../../../../components/page-tools/form-style'
import { MODE } from '../../../../../config'

const notVisibleOption = [
  'Suboptimal Image Resolution',
  'Improper Fetal Position',
  'Other',
]

function NotVisibleForm({
  inputRef,
  defaultValue,
  width,
  handleChange = undefined,
}) {
  return (
    <FormControl size='small' sx={{ ...inputStyle, width, ml: 0.5, mt: 1 }}>
      <InputLabel
        shrink
        sx={{
          fontSize: 20,
        }}
      >
        Details
      </InputLabel>
      <Select
        inputRef={inputRef}
        size='small'
        variant='outlined'
        notched
        sx={{
          fontSize: 16,
          pt: 0.2,
          pb: 0,
          pl: 1.2,

          color: theme => MODE[theme.palette.mode].dataGrid.font,
        }}
        label='Details'
        defaultValue={defaultValue}
        onChange={handleChange ? e => handleChange(e) : undefined}
      >
        <MenuItem value=''></MenuItem>
        {notVisibleOption.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default NotVisibleForm
