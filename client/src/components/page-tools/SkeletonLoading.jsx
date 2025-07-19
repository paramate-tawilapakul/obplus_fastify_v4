// import LinearProgress from '@mui/material/LinearProgress'

// function SkeletonLoading({ style = null }) {
//   return <LinearProgress sx={style || { mt: -0.5 }} />
// }

// export default SkeletonLoading

import LinearProgress from '@mui/material/LinearProgress'
import { useEffect, useRef, useState } from 'react'

function SkeletonLoading({ style = { mt: -0.5 }, loading }) {
  // console.log('isLoading', loading)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (loading) {
      // start a 200ms timer; only show when it fires
      timerRef.current = setTimeout(() => {
        setVisible(true)
        timerRef.current = null
      }, 200)
    } else {
      // loading done
      if (timerRef.current) {
        // never showed—cancel the timer
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      // hide immediately if it was visible
      setVisible(false)
    }

    return () => {
      // cleanup on unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [loading])
  return <>{visible && <LinearProgress sx={{ ...style }} />}</>
}

export default SkeletonLoading
