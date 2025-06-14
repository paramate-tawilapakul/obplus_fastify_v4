import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { APP_CONFIG, MODE } from '../../config'
import darkLogo from '../../assets/img/logo_bigtree_dark.png'

const Footer = ({ hspName, user }) => {
  const dt = new Date()
  const year = dt.getFullYear()
  const licenseCountdownDays = parseInt(
    window.localStorage.getItem('licenseCountdownDays')
  )

  return (
    <>
      {hspName && (
        <AppBar
          position='static'
          component='footer'
          sx={{
            color: 'white',
            bgcolor: theme => MODE[theme.palette.mode].footer,
          }}
        >
          <Toolbar variant='dense' sx={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={darkLogo}
                alt='company logo'
                style={{ height: 22, marginTop: '-3px' }}
              />
              <Typography component={'span'} variant={'body2'}>
                <span
                  style={{
                    color: '#ffffff',
                  }}
                >
                  <strong>BJH </strong>
                </span>
                <span
                  style={{
                    color: '#ffffff',
                  }}
                >
                  <strong>Medical</strong>
                </span>
                &nbsp;&copy;2018-{year} <strong>OBPlus</strong> | Obstetrics
                &#38; Gynecology
              </Typography>
            </div>

            <Typography
              variant='caption'
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              {(user?.code === 'admin' || licenseCountdownDays < 15) && (
                <div
                  style={{
                    fontSize: 12,
                    color: licenseCountdownDays < 15 ? 'yellow' : undefined,
                  }}
                >
                  License expiry date:{' '}
                  {window.localStorage.getItem('licenseExpDate')}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              )}
              <div>
                {hspName}&nbsp;&nbsp;{APP_CONFIG.VERSION}
              </div>
            </Typography>
          </Toolbar>
        </AppBar>
      )}
    </>
  )
}

export default Footer
