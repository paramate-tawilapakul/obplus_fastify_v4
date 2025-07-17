import TextField from '@mui/material/TextField'
import { inputStyle } from './form-style'

const InputTextField = ({
  inputRef = undefined,
  form,
  value,
  handleChange = undefined,
  width = 330,
  label = '',
  readOnly = undefined,
  placeholder = undefined,
  sx = {},
  name = undefined,
  endAdornment = undefined,
  paddingTop = 10,
  paddingLeft = 22,
  showLabel = true,
}) => {
  // console.log('InputTextField', form.valueId, value)
  // console.log('InputTextField', stateValue, value)
  return (
    <TextField
      name={name}
      autoComplete='off'
      placeholder={placeholder}
      inputRef={inputRef}
      size='small'
      variant='outlined'
      label={showLabel ? label || form.name : ''}
      InputProps={{
        readOnly,
        endAdornment,
      }}
      InputLabelProps={{
        shrink: true,
        sx: {
          mt: -0.3,
          fontSize: 20,
        },
      }}
      inputProps={{
        style: {
          fontSize: 16,
          paddingTop,
          paddingBottom: 8,
          paddingLeft,
        },
      }}
      sx={{
        ...inputStyle,
        ml: 0,
        width,
        backgroundColor: theme =>
          theme.palette.mode === 'light' ? 'white' : '#393939',
        ...sx,
      }}
      defaultValue={value}
      onChange={handleChange}
    />
  )
}

export default InputTextField
