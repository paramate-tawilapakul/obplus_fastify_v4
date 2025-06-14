import PropTypes from 'prop-types'
import LinearProgress from '@mui/material/LinearProgress'

function SkeletonLoading({ style = null }) {
  return <LinearProgress sx={style || { mt: -0.5 }} />
}

SkeletonLoading.propTypes = {
  tabNheightame: PropTypes.number,
}

export default SkeletonLoading
