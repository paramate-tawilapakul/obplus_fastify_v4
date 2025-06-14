import TextField from '@mui/material/TextField'
import {
  inputStyle,
  modifiedContentStyle,
} from '../../../../../components/page-tools/form-style'
import { orange } from '@mui/material/colors'

function ModifiedContent({ inputRef, dataForm, width, row = 5 }) {
  return (
    <TextField
      inputRef={inputRef}
      label='Modified Content'
      variant='outlined'
      size='small'
      margin='dense'
      name='content'
      placeholder='Only this field will show in report...'
      defaultValue={dataForm.content.replace(/<br\s*[/]?>/gi, '\n')}
      sx={{
        ...inputStyle,
        ...modifiedContentStyle,
        width,
        mt: 2,
      }}
      multiline
      rows={row}
      inputProps={{ style: { resize: 'vertical', paddingTop: 5 } }}
      InputLabelProps={{
        shrink: true,
        sx: {
          mt: -0.3,
          fontSize: 24,
          color: theme =>
            theme.palette.mode === 'dark' ? orange[200] : orange[900],
        },
      }}
    />
  )
}

export default ModifiedContent
