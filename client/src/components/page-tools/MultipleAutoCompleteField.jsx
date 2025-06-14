import Checkbox from '@mui/material/Checkbox'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import TextField from '@mui/material/TextField'
import { inputStyle } from './form-style'
import { Chip } from '@mui/material'

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

function MultipleAutoCompleteField({
  options = [],
  selected = [],
  handleChange,
  setSelected,
  width = 330,
  form,
}) {
  return (
    <Autocomplete
      size='small'
      multiple
      id='checkboxes-tags-demo'
      onChange={(event, newValue) => {
        setSelected(newValue)
        handleChange(event, form, newValue, true)
      }}
      value={selected}
      options={options}
      clearIcon={false}
      disableCloseOnSelect
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={option => `${option.name}`}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={index}
            variant='filled'
            //   size='small'
            label={option.name}
            sx={{ fontSize: 16 }}
          />
        ))
      }
      ListboxProps={{
        style: {
          maxHeight: '275px',
        },
      }}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          key={option.name}
          style={{ margin: 0, padding: 0, paddingLeft: 10 }}
        >
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            sx={{ ml: -1, mr: 1, p: 1 }}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      sx={{
        ...inputStyle,
        width,
        ml: -0.1,
      }}
      renderInput={params => (
        <TextField
          {...params}
          label='Diagnosis'
          InputLabelProps={{
            shrink: true,
            sx: {
              mt: -0.3,
              fontSize: 20,
            },
          }}
        />
      )}
    />
  )
}

export default MultipleAutoCompleteField
