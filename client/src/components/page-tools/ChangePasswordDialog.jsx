import { useState } from 'react'
import axios from 'axios'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import KeyIcon from '@mui/icons-material/Key'
import { API } from '../../config'
import { Alert, Divider, TextField } from '@mui/material'
import { sleep } from '../../utils'
import { dialogTitleStyle, inputStyle2, btStyle } from './form-style'

function ChangePasswordDialog({ dialog, setDialog }) {
  const defaultForm = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  }

  const defaultError = {
    show: false,
    msg: '',
  }
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState(defaultError)
  const [complete, setComplete] = useState(false)

  function handleClose() {
    setDialog(false)
    setError(defaultError)
    setForm(defaultForm)
    setComplete(false)
  }

  async function changePassword() {
    setError({ show: false, msg: '' })
    setComplete(false)

    const [currentPassword, newPassword, confirmNewPassword] = Object.keys(
      form
    ).map(k => form[k].trim())

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      let msg = !currentPassword
        ? 'Current Password'
        : !newPassword
        ? 'New Password'
        : !confirmNewPassword
        ? 'Confirm Password'
        : ''

      msg += ' is required'
      return setError({ show: true, msg })
    }

    if (newPassword !== confirmNewPassword) {
      return setError({ show: true, msg: 'Password not match' })
    }

    const result = await axios.post(API.CHANGE_PASSWORD, {
      oldPassword: currentPassword,
      newPassword: newPassword,
    })

    if (result.data.message === 'Incorrect current password') {
      return setError({ show: true, msg: result.data.message })
    }

    setComplete(true)
    sleep(3000).then(() => handleClose())
  }
  return (
    <Dialog
      open={dialog}
      onClose={handleClose}
      maxWidth={'sm'}
      fullWidth
      PaperProps={{ elevation: 4 }}
    >
      <DialogTitle
        sx={{
          ...dialogTitleStyle,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <KeyIcon />
        <div>&nbsp;Change Password</div>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText component='div'>
          <TextField
            required
            value={form.currentPassword}
            type='password'
            label='Current Password'
            variant='outlined'
            size='small'
            margin='dense'
            name='currentPassword'
            fullWidth
            sx={{ ...inputStyle2, mt: -1 }}
            onChange={e =>
              setForm(prev => ({ ...prev, currentPassword: e.target.value }))
            }
          />
          <TextField
            required
            value={form.newPassword}
            type='password'
            label='New Password'
            variant='outlined'
            size='small'
            margin='dense'
            name='newPassword'
            fullWidth
            onChange={e =>
              setForm(prev => ({ ...prev, newPassword: e.target.value }))
            }
            // sx={{ mt: 0.5 }}
            sx={inputStyle2}
          />
          <TextField
            required
            value={form.confirmNewPassword}
            type='password'
            label='Confirm New Password'
            variant='outlined'
            size='small'
            margin='dense'
            name='confirmPassword'
            fullWidth
            onChange={e =>
              setForm(prev => ({
                ...prev,
                confirmNewPassword: e.target.value,
              }))
            }
            // sx={{ mt: 0.5 }}
            sx={inputStyle2}
          />
        </DialogContentText>
        <div style={{ height: 60, marginTop: 4 }}>
          {error.show && <Alert severity='warning'>{error.msg}</Alert>}

          {complete && (
            <Alert severity='success'>
              Change Password Completed! Auto close in 3 seconds
            </Alert>
          )}
        </div>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          ml: 2,
          mt: -4,
        }}
      >
        <Button
          size='large'
          variant='outlined'
          //   color='warning'
          onClick={() => handleClose()}
        >
          Close
        </Button>
        <Button
          size='large'
          variant='contained'
          sx={btStyle}
          onClick={changePassword}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangePasswordDialog
