import DialogTitle from '@mui/material/DialogTitle'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

import { dialogTitleStyle } from '../../../../../components/page-tools/form-style'

function Title({ titleName, type, handleClose }) {
  return (
    <>
      <DialogTitle sx={dialogTitleStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {titleName}{' '}
            {['Abnormal', 'Not Visible'].includes(type) && (
              <Chip
                label={type}
                sx={{ fontSize: 16 }}
                size='medium'
                color={type === 'Abnormal' ? 'error' : 'info'}
              />
            )}
          </div>
          <IconButton onClick={handleClose} sx={{ mr: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <Divider />
    </>
  )
}

export default Title
