import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

const BackDrop = ({ openBackDrop }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: theme => theme.zIndex.drawer + 1,
      }}
      open={openBackDrop}
      // onClick={handleClose}
    >
      <CircularProgress color='inherit' size={60} />
    </Backdrop>
  )
}

export default BackDrop
