import Checkbox from '@mui/material/Checkbox'
import Autocomplete from '@mui/material/Autocomplete'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import TextField from '@mui/material/TextField'
import { inputStyle } from './form-style'
import { Chip } from '@mui/material'

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

function filterSelection(selected) {
  let other = selected.find(value => value.name === 'Other')
  if (other) {
    if (selected.length === 1) return [other]
    else if (selected.length > 1) {
      if (selected[0].name === 'Other') {
        return selected.filter(value => value.name !== 'Other')
      } else {
        return selected.filter(value => value.name === 'Other')
      }
    }
  }
  return selected
}

function ProcedureAutoCompleteField({
  options = [],
  selected = [],
  handleChangeFunction,
  setSelected,
  width = 330,
  form,
}) {
  return (
    <Autocomplete
      size='small'
      multiple
      id='checkboxes-tags-demo'
      onChange={async (e, newValue) => {
        let selectedValue = filterSelection(newValue)
        setSelected(selectedValue)

        if (selectedValue?.length === 0) {
          e.target.value = ''
        } else if (selectedValue[0]?.name === 'Other') {
          e.target.value = selectedValue[0].opId
        } else {
          e.target.value = selectedValue[0].opId
        }
        handleChangeFunction(e, form, selectedValue)
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
          label={form.name}
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

export default ProcedureAutoCompleteField
