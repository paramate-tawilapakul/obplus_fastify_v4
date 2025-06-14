import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'

import { inputStyle } from './form-style'
import { MODE } from '../../config'

const SelectField = ({
  value,
  handleChange,
  form,
  m = 0,
  minWidth = 330,
  maxWidth = 330,
  firstOptionBlank = true,
  controlled = false,
}) => {
  return (
    <FormControl size='small' sx={{ ...inputStyle, m, minWidth, maxWidth }}>
      <InputLabel
        shrink
        sx={{
          fontSize: 20,
        }}
      >
        {form.name}
      </InputLabel>
      <Select
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
        label={form.name}
        defaultValue={value}
        value={controlled ? value : undefined}
        onChange={handleChange}
      >
        {firstOptionBlank && <MenuItem value=''></MenuItem>}
        {form.options.map(o => (
          <MenuItem key={o.opId} value={o.opId}>
            <Typography
              variant='body2'
              sx={{ whiteSpace: 'wrap', textWrap: 'balance', mt: 0.3 }}
            >
              {form.valueId >= 141 && form.valueId <= 145
                ? o.opName
                : o.display}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SelectField
