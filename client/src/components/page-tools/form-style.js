import { orange } from '@mui/material/colors'
import { MODE } from '../../config'

export const inputMargin = 0.95

export const dialogContentBgColor = {
  bgcolor: theme => (theme.palette.mode === 'light' ? '#f9f9f9' : '#2C2C2C'),
}

export const modifiedContentStyle = {
  '& label.Mui-focused': {
    color: theme => (theme.palette.mode === 'dark' ? orange[200] : orange[900]),
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      fontSize: 24,
    },
    '&:hover fieldset': {
      borderColor: theme =>
        theme.palette.mode === 'dark' ? orange[200] : orange[900],
    },
    '&.Mui-focused fieldset': {
      borderColor: theme =>
        theme.palette.mode === 'dark' ? orange[200] : orange[900],
    },
  },
}

export const inputStyle = {
  ml: 0.5,
  color: theme => MODE[theme.palette.mode].dataGrid.font,
  bgcolor: theme => (theme.palette.mode === 'light' ? 'white' : '#393939'),
  '& label.Mui-focused': {
    color: theme => MODE[theme.palette.mode].input,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: theme => MODE[theme.palette.mode].input,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      fontSize: 20,
      // mt: 0,
    },
    '&:hover fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
  },
}

export const inputStyle2 = {
  bgcolor: theme => (theme.palette.mode === 'light' ? 'white' : '#393939'),
  '& label.Mui-focused': {
    color: theme => MODE[theme.palette.mode].input,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: theme => MODE[theme.palette.mode].input,
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
  },
}

export const btStyle = {
  backgroundColor: theme => MODE[theme.palette.mode].button,
  ':hover': {
    bgcolor: theme => MODE[theme.palette.mode].buttonHover,
  },
}

export const inputBgColor = {
  bgcolor: theme => (theme.palette.mode === 'light' ? 'white' : '#393939'),
}

export const dialogTitleStyle = {
  p: 0,
  pl: 3,
  py: 1,
  bgcolor: theme => MODE[theme.palette.mode].dialog.header,
}

export const checkboxStyle = {
  '.MuiSvgIcon-root': {
    color: theme => MODE[theme.palette.mode].dataGrid.checkbox,
  },
  '.MuiCheckbox-root': {
    bgcolor: theme => MODE[theme.palette.mode].tab.active,
    p: 0,
    borderRadius: 1,
  },
  '.MuiCheckbox-root:hover ': {
    bgcolor: theme => MODE[theme.palette.mode].tab.active,
  },
}

export const inputStyle3 = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      fontSize: 16,
      // mt: 0,
    },
    '&:hover fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme => MODE[theme.palette.mode].input,
    },
  },
}
