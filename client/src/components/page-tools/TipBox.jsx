import PropTypes from 'prop-types'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

function TipBox({
  message,
  placement,
  component = null,
  noDot = false,
  data = 'none',
}) {
  return (
    <Tooltip
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: theme =>
              theme.palette.mode === 'dark' ? '#F5F5F5' : '#004b49   ',
            color: theme =>
              theme.palette.mode === 'dark' ? '#333' : '#f2f2f2',
          },
        },
        arrow: {
          sx: {
            '&::before': {
              bgcolor: theme =>
                theme.palette.mode === 'dark' ? '#F5F5F5' : '#004b49   ',
            },
          },
        },
      }}
      enterDelay={0}
      placement={placement}
      arrow
      title={
        component ? (
          component
        ) : (
          <Typography sx={{ p: 0.5 }} variant='body1'>
            {message}
          </Typography>
        )
      }
    >
      <Typography
        variant='body2'
        component='div'
        style={{
          fontSize: `16px`,
          marginLeft: noDot ? 10 : undefined,
        }}
      >
        {!noDot && message && message?.length > 12
          ? message.slice(0, 12) + '...'
          : message}
        {data !== 'none' && (
          <div
            style={{
              float: 'right',
              paddingRight: 5,
              color: data.length === 0 ? 'white' : 'blue',
              fontWeight: 'bold',
            }}
          >
            {data.length}
          </div>
        )}
      </Typography>
    </Tooltip>
  )
}

TipBox.propTypes = {
  message: PropTypes.string.isRequired,
  placement: PropTypes.string.isRequired,
}

export default TipBox
