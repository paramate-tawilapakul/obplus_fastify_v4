export function getMaxHeight(useMediaQuery, maxHeight = 470, minus = 0) {
  let height = maxHeight
  //eslint-disable-next-line
  const height1024px = useMediaQuery('(max-height:1024px)')
  //eslint-disable-next-line
  const height900px = useMediaQuery('(max-height:900px)')
  //eslint-disable-next-line
  const height768px = useMediaQuery('(max-height:768px)')
  if (height768px) {
    height = 470
  } else if (height900px) {
    height = 600
  } else if (height1024px) {
    height = 720
  }

  return height - minus
}

export function getMatchScreenWidth(useMediaQuery, defaultValue = 10) {
  let px = defaultValue
  //eslint-disable-next-line
  const matches1366px = useMediaQuery('(max-width:1366px)')
  //eslint-disable-next-line
  const matches1600px = useMediaQuery('(max-width:1600px)')
  //eslint-disable-next-line
  const matches1920px = useMediaQuery('(max-width:1920px)')

  if (matches1366px) {
    px = 10
  } else if (matches1600px) {
    px = 16
  } else if (matches1920px) {
    px = 24
  }

  return px
}

export function getMatchScreenWidth2(useMediaQuery, defaultValue = 10) {
  let px = defaultValue
  //eslint-disable-next-line
  const matches1366px = useMediaQuery('(max-width:1366px)')

  if (matches1366px) {
    px = 10
  }

  return px
}
