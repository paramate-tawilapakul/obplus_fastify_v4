import { useRef, useEffect, useState, useContext } from 'react'
import { blue, grey, orange, green } from '@mui/material/colors'
import axios from 'axios'
import { Typography } from '@mui/material'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import {
  //   toPng,
  toJpeg,
  //   toBlob,
  //    toPixelData,
  //    toSvg
} from 'html-to-image'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { API, FETUS_NAME, MODE } from '../../../../../config'
import DataContext from '../../../../../context/data/dataContext'

const data = [
  {
    ga: '20',
    P3: 169,
    P10: 207,
    P50: 287,
    P90: 367,
  },
  {
    ga: '21',
    P3: 225,
    P10: 268,
    P50: 359,
    P90: 450,
  },
  {
    ga: '22',
    P3: 292,
    P10: 341,
    P50: 445,
    P90: 549,
  },
  {
    ga: '23',
    P3: 368,
    P10: 424,
    P50: 543,
    P90: 662,
  },
  {
    ga: '24',
    P3: 453,
    P10: 517,
    P50: 653,
    P90: 789,
  },
  {
    ga: '25',
    P3: 546,
    P10: 618,
    P50: 773,
    P90: 928,
  },
  {
    ga: '26',
    P3: 645,
    P10: 727,
    P50: 903,
    P90: 1078,
  },
  {
    ga: '27',
    P3: 750,
    P10: 843,
    P50: 1041,
    P90: 1239,
  },
  {
    ga: '28',
    P3: 859,
    P10: 964,
    P50: 1186,
    P90: 1409,
  },
  {
    ga: '29',
    P3: 972,
    P10: 1089,
    P50: 1338,
    P90: 1588,
  },
  {
    ga: '30',
    P3: 1088,
    P10: 1218,
    P50: 1495,
    P90: 1773,
  },
  {
    ga: '31',
    P3: 1205,
    P10: 1349,
    P50: 1657,
    P90: 1965,
  },
  {
    ga: '32',
    P3: 1322,
    P10: 1481,
    P50: 1822,
    P90: 2162,
  },
  {
    ga: '33',
    P3: 1439,
    P10: 1614,
    P50: 1989,
    P90: 2364,
  },
  {
    ga: '34',
    P3: 1554,
    P10: 1746,
    P50: 2157,
    P90: 2568,
  },
  {
    ga: '35',
    P3: 1667,
    P10: 1877,
    P50: 2326,
    P90: 2775,
  },
  {
    ga: '36',
    P3: 1776,
    P10: 2004,
    P50: 2494,
    P90: 2983,
  },
  {
    ga: '37',
    P3: 1880,
    P10: 2128,
    P50: 2660,
    P90: 3191,
  },
  {
    ga: '38',
    P3: 1978,
    P10: 2247,
    P50: 2823,
    P90: 3398,
  },
  {
    ga: '39',
    P3: 2071,
    P10: 2360,
    P50: 2982,
    P90: 3603,
  },
  {
    ga: '40',
    P3: 2154,
    P10: 2467,
    P50: 3136,
    P90: 3805,
  },
]

const EFW = ({ patient }) => {
  // console.log(patient.noFetus)
  let wWidth = window.innerWidth - 500
  let wHeight = window.innerHeight - 240

  let defaultWidth = patient.noFetus === 1 ? 850 : 800
  let defaultHeight = 530

  const [elHeight, setElHeight] = useState(
    wHeight < defaultHeight ? defaultHeight : wHeight
  )
  const [elWidth, setElWidth] = useState(
    wWidth < defaultWidth ? defaultWidth : wWidth > 1084 ? 1084 : wWidth
  )

  window.addEventListener('resize', setElementHeight)
  function setElementHeight(e) {
    let newHeight = e.currentTarget.innerHeight - 240
    if (newHeight < defaultHeight) newHeight = defaultHeight
    setElHeight(newHeight)

    let newWidth = e.currentTarget.innerWidth - 500
    if (newWidth < defaultWidth) newWidth = defaultWidth
    else if (newWidth > 1084) newWidth = 1084
    setElWidth(newWidth)
  }

  const { isFwhlChanged, setIsFwhlChanged, theme } = useContext(DataContext)
  const efwRef = useRef(null)
  const efw2Ref = useRef(null)
  const [efw, setEfw] = useState(null)
  const [checked, setChecked] = useState(false)

  async function getEfw() {
    // console.log('getEfw', patient.currentFetus)
    setChecked(false)
    try {
      const res = await axios.get(API.EFW, {
        params: {
          hn: patient.hn,
          accession: patient.accession,
          fetusNo: patient.currentFetus,
        },
      })
      //   console.log(res.data.data.data)
      let efData = res.data.data.data

      if (efData.length > 0) {
        let efwPath = res.data.data.efwPath
        let newData = data.map(d => {
          let findGa = efData.find(e => e.ga === d.ga)
          if (findGa) {
            return {
              ...d,
              FW: findGa.fw,
            }
          }

          return d
        })

        setEfw(newData)
        if (efwPath) {
          // console.log('test')
          setChecked(true)
        }

        setTimeout(async () => {
          if (isFwhlChanged && checked) {
            // console.log('upload new')
            await attachEfw()
          }
        }, 100)

        setIsFwhlChanged(false)
      }
    } catch (error) {
      console.log(error)
    } finally {
      //  setIsFwhlChanged(false)
    }
  }

  useEffect(() => {
    setEfw(null)
    getEfw()

    return () => {}

    // eslint-disable-next-line
  }, [patient, isFwhlChanged])

  //   useEffect(() => {
  //     getEfw()

  //     return () => {}
  //   }, [isFwhlChanged])

  //   function blobToDataURL(blob) {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader()
  //       reader.onload = _e => resolve(reader.result)
  //       reader.onerror = _e => reject(reader.error)
  //       reader.onabort = _e => reject(new Error('Read aborted'))
  //       reader.readAsDataURL(blob)
  //     })
  //   }
  //   function blobToBuffer(blob) {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader()
  //       reader.onload = _e => resolve(reader.result)
  //       reader.onerror = _e => reject(reader.error)
  //       reader.onabort = _e => reject(new Error('Read aborted'))
  //       reader.readAsArrayBuffer(blob)
  //     })
  //   }
  //   async function uploadEfw() {
  //     let svgURL = new XMLSerializer().serializeToString(efwRef.current)
  //     let svgBlob = new Blob([svgURL], { type: 'image/svg+xml;charset=utf-8' })

  //     let formData = new FormData()
  //     let fileName = `efw.svg`
  //     let file = new File([svgBlob], fileName)

  //     formData.append('file', file, fileName)
  //     formData.append('accession', patient.accession)
  //     formData.append('fetusNo', patient.currentFetus)
  //     formData.append('svgDataUrl', await blobToDataURL(svgBlob))
  //     // formData.append('svgDataUrl', new Uint8Array(await blobToBuffer(svgBlob)))
  //     // console.log(svgURL)
  //     // formData.append('svgDataUrl', svgURL)

  //     // formData.append('svgDataUrl', svgBlob)

  //     const res = await axios.post(API.UPLOAD_EFW, formData, {
  //       headers: {
  //         'Content-Type': `multipart/form-data`,
  //       },
  //     })

  //     // console.log(res.data.data.src)

  //     let t = JSON.parse(window.localStorage.getItem(STORAGE_NAME.efwCharts))
  //     // t[`efw${patient.currentFetus}`] = res.data.data.src
  //     t[`efw${patient.currentFetus}`] = svgURL
  //     window.localStorage.setItem(STORAGE_NAME.efwCharts, JSON.stringify(t))
  //   }

  const CustomizedDot = props => {
    const { cx, cy, payload, value } = props
    let { P3, P90 } = payload
    let color = 'red'

    if (value) {
      if (value >= P3 && value <= P90) {
        color = theme === 'dark' ? blue[400] : blue[500]
      }

      return (
        <svg
          x={cx - 6}
          y={cy - 6}
          width={120}
          height={120}
          fill={color}
          viewBox='0 0 1024 1024'
        >
          <circle r='45' cx='50' cy='50' fill={color} />
        </svg>
      )
    }
  }

  const CustomizedDot2 = props => {
    const { cx, cy, payload, value } = props
    let { P3, P90 } = payload
    let color = 'red'

    if (value) {
      if (value >= P3 && value <= P90) {
        color = blue[500]
      }

      return (
        <svg
          x={cx - 6}
          y={cy - 6}
          width={120}
          height={120}
          fill={color}
          viewBox='0 0 1024 1024'
        >
          <circle r='45' cx='50' cy='50' fill={color} />
        </svg>
      )
    }
  }

  async function dettachEfw() {
    try {
      await axios.delete(API.EFW_CHARTS, {
        params: { accession: patient.accession, fetusNo: patient.currentFetus },
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function attachEfw() {
    try {
      const dataUrl = await toJpeg(efw2Ref.current, { quality: 0.95 })

      if (dataUrl.length < 100) return alert('Error with generating charts')

      let formData = new FormData()
      formData.append('accession', patient.accession)
      formData.append('fetusNo', patient.currentFetus)
      formData.append('dataUrl', dataUrl)

      await axios.post(API.EFW_CHARTS, formData, {
        headers: {
          'Content-Type': `application/json`,
        },
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {efw && (
        <div style={{ display: 'flex' }}>
          <div
            ref={efwRef}
            style={{
              width: elWidth,
              minWidth: elWidth,
              // height: 640,
              height: elHeight,
              margin: 0,
              padding: 0,
              paddingTop: 5,
              backgroundColor: MODE[theme].tab,
              bottom: 0,
              zIndex: 1000,
            }}
          >
            <div
              style={{
                display: 'flex',
                // justifyContent: 'center',
                // border: '1px solid red',
              }}
            >
              <Typography
                variant='h6'
                align='center'
                sx={{
                  mb: 2,
                  ml: patient.noFetus === 1 ? 12 : 8,
                  color: MODE[theme].patientInfo.color,
                  width: '88%',
                  // border: '1px solid red',
                }}
              >
                Estimated Fetal Weight
                {patient.noFetus === 1
                  ? ``
                  : `(Fetus ${FETUS_NAME[patient.currentFetus]})`}
              </Typography>
              <FormGroup
                sx={{
                  // ml: 2,
                  mt: -1,
                  whiteSpace: 'nowrap',
                  // border: '1px solid red',
                }}
              >
                <FormControlLabel
                  control={<Checkbox />}
                  checked={checked}
                  label='Attach'
                  onChange={async e => {
                    // console.log(e.target.checked)
                    if (e.target.checked) {
                      await attachEfw()
                      return setChecked(true)
                    }

                    await dettachEfw()
                    setChecked(false)
                  }}
                />
              </FormGroup>
            </div>

            <LineChart
              width={elWidth - 20}
              // height={580}
              height={elHeight - 60}
              data={efw}
              margin={{
                top: 0,
                // right: 30,
                // left: 20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                tickLine={false}
                dataKey='ga'
                tick={{ fill: MODE[theme].patientInfo.color }}
              />
              <YAxis
                tickLine={false}
                type='number'
                domain={[0, 4000]}
                tickCount={9}
                tick={{ fill: MODE[theme].patientInfo.color }}
              />
              <Tooltip
                labelFormatter={value => {
                  return <span style={{ color: '#000' }}>{value}weeks</span>
                }}
              />
              <Legend />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P90'
                stroke={orange[500]}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P50'
                stroke={grey[400]}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P10'
                stroke='#a9a9e5'
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P3'
                stroke={theme === 'dark' ? green[300] : green[500]}
                // activeDot={{ r: 4 }}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                dataKey='FW'
                legendType='circle'
                stroke={theme === 'dark' ? blue[400] : blue[500]}
                // activeDot={{ r: 6 }}
                dot={<CustomizedDot />}
              />
            </LineChart>
          </div>
          <div
            ref={efw2Ref}
            style={{
              position: 'absolute',
              width: 920,
              minWidth: 920,
              height: 640,
              margin: 0,
              padding: 0,
              paddingTop: 5,
              backgroundColor: '#F9F9F9',
              top: 0,
              left: 0,
              zIndex: -500,
            }}
          >
            <Typography
              variant='h6'
              align='left'
              sx={{
                mb: 2,
                ml: patient.noFetus === 1 ? 45 : 41,
                color: '#111',
              }}
            >
              Estimated Fetal Weight{' '}
              {patient.noFetus === 1
                ? ``
                : `(Fetus ${FETUS_NAME[patient.currentFetus]})`}
            </Typography>
            <LineChart
              width={900}
              height={580}
              data={efw}
              margin={{
                top: 0,
                // right: 30,
                // left: 20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis tickLine={false} dataKey='ga' tick={{ fill: '#333333' }} />
              <YAxis
                tickLine={false}
                type='number'
                domain={[0, 4000]}
                tickCount={9}
                tick={{ fill: '#333333' }}
              />

              <Legend />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P90'
                stroke={orange[500]}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P50'
                stroke={grey[400]}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P10'
                stroke='#a9a9e5'
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey='P3'
                stroke={green[300]}
                // activeDot={{ r: 4 }}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                dataKey='FW'
                legendType='circle'
                stroke={blue[500]}
                // activeDot={{ r: 6 }}
                dot={<CustomizedDot2 />}
              />
            </LineChart>
          </div>
          {/* <FormGroup sx={{ ml: 2, whiteSpace: 'nowrap' }}>
            <FormControlLabel
              control={<Checkbox />}
              checked={checked}
              label='Attach'
              onChange={async e => {
                // console.log(e.target.checked)
                if (e.target.checked) {
                  await attachEfw()
                  return setChecked(true)
                }

                await dettachEfw()
                setChecked(false)
              }}
            />
          </FormGroup> */}
        </div>
      )}
    </>
  )
}

export default EFW
