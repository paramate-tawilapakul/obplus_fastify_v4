import { useState } from 'react'
import TextField from '@mui/material/TextField'
import makeStyles from '@mui/styles/makeStyles'
import { inputStyle } from './form-style'
import { MODE } from '../../config'

const useStyles = makeStyles(() => ({
  textarea: {
    resize: 'both',
  },
}))

const redStyle = {
  '& label.Mui-focused': {
    color: 'red',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'red',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      fontSize: 20,
      borderColor: 'red',
    },
    '&:hover fieldset': {
      borderColor: 'red',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'red',
    },
  },
}

const CommentField = ({
  form,
  value,
  handleChange,
  minWidth = 450,
  maxWidth = 600,
  m = 0,
  isRedStyle = false,
  row = 3,
  placeholder = undefined,
}) => {
  // console.log('CommentField', form, value)
  const classes = useStyles()
  let rStyle = {}
  if (isRedStyle) rStyle = { ...redStyle }

  const [data, setData] = useState(value?.replace(/<br>/g, '\n') || '')

  return (
    <TextField
      autoComplete='off'
      sx={{
        ...inputStyle,
        minWidth,
        maxWidth,
        m,
        color: theme => MODE[theme.palette.mode].dataGrid.font,
        ...rStyle,
      }}
      label={form?.name?.replace('Comments', 'Comment') || ''}
      variant='outlined'
      multiline
      rows={row}
      // defaultValue={value?.replace(/<br>/g, '\n')}
      value={data}
      onChange={e => {
        // console.log('setData', e.target.value)
        setData(e.target.value)
        handleChange(e, form)
      }}
      placeholder={placeholder}
      inputProps={{
        className: classes.textarea,
        style: {
          fontSize: 16,
          paddingTop: 0,
          paddingBottom: 4,
          paddingLeft: 10,
        },
      }}
      InputLabelProps={{
        shrink: true,
        sx: {
          mt: -0.3,
          // ml: 1.5,
          fontSize: 20,
          color: isRedStyle && 'red',
          fontWeight: isRedStyle && 'bold',
        },
      }}
    />
  )
}

export default CommentField
