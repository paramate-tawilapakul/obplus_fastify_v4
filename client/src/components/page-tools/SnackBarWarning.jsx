import PropTypes from 'prop-types'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
function SnackBarWarning({
  snackWarning,
  setSnackWarning,
  vertical,
  horizontal,
}) {
  const autoHideDuration = 3000

  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={snackWarning.show}
      onClose={() =>
        setSnackWarning(prev => ({
          ...prev,
          show: false,
          message: null,
          component: null,
          bgcolor: null,
        }))
      }
      key={vertical + horizontal}
      autoHideDuration={snackWarning.autoHideDuration || autoHideDuration}
    >
      <MuiAlert
        elevation={6}
        variant='filled'
        severity={snackWarning.severity}
        icon={snackWarning.icon || undefined}
        sx={{
          fontSize: 16,
          color: 'white',
          bgcolor: snackWarning.bgcolor || undefined,
        }}
      >
        {snackWarning.component ? (
          snackWarning.component
        ) : (
          <Typography variant='body1' sx={{ color: 'white' }}>
            {snackWarning.message}
          </Typography>
        )}
      </MuiAlert>
    </Snackbar>
  )
}

SnackBarWarning.propTypes = {
  snackWarning: PropTypes.object.isRequired,
  setSnackWarning: PropTypes.func.isRequired,
  vertical: PropTypes.string.isRequired,
  horizontal: PropTypes.string.isRequired,
}

export default SnackBarWarning
