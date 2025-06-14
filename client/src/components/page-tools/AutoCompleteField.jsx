import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { inputStyle } from './form-style'
import { MODE } from '../../config'

const AutoCompleteField = ({
  ctrlValue,
  handleChange,
  form,
  m = 0,
  width = 330,
  freeSolo = undefined,
}) => {
  return (
    <Autocomplete
      disablePortal
      freeSolo={freeSolo}
      size='small'
      options={form.options}
      sx={{ ...inputStyle, m, width, fontSize: 20 }}
      value={ctrlValue}
      // isOptionEqualToValue={(option, value) => {
      //   return option.opId === value.opId || option.name === value.name
      // }}
      onChange={handleChange}
      renderInput={params => (
        <TextField
          label={form.name}
          {...params}
          sx={{
            fontSize: 20,
            // mt: 0.2,
            // pt: 0.1,
            // pb: 0.1,
            // pl: 1,
            // p: 0,
            color: theme => MODE[theme.palette.mode].dataGrid.font,
          }}
          InputProps={{
            ...params.InputProps,
            style: {
              paddingLeft: 14,
              fontSize: 16,
              paddingTop: 8,
              // paddingBottom: 0,
            },
          }}
          variant='outlined'
          InputLabelProps={{
            shrink: true,
            sx: {
              // mt: 1,
              // ml: 1.5,
              fontSize: 20,
            },
          }}
        />
      )}
    />
  )
}

export default AutoCompleteField
