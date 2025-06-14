import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { useHistory } from 'react-router-dom'

import { APP_CONFIG, APP_ROUTES } from '../../config'

const Button = () => {
  const history = useHistory()
  return (
    <div
      style={{
        position: 'absolute',
        top: '75px',
        left: '10px',
      }}
    >
      <IconButton
        aria-label='back'
        sx={{
          boxShadow: 10,
          border: theme =>
            theme.palette.mode === 'dark'
              ? '1px solid #6c6c6c'
              : '1px solid #e0e0e0',
          color: theme => (theme.palette.mode === 'dark' ? 'white' : '#333'),
          bgcolor: theme =>
            theme.palette.mode === 'dark' ? undefined : 'white',
        }}
        size='medium'
        onClick={() => {
          history.push(
            `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}`
          )
        }}
      >
        <ArrowBackIcon fontSize='large' sx={{ fontSize: 40 }} />
      </IconButton>
    </div>
  )
}

export default Button
