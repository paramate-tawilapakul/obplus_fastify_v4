import { useEffect, useState } from 'react'
import axios from 'axios'

import { API, reqHeader } from '../../../config'
import SnackBarWarning from '../../../components/page-tools/SnackBarWarning'

let tempHr = []
for (let i = 0; i < 25; i++) {
  tempHr.push(i)
}
tempHr = [...tempHr, 48, 72, 9999999]
const HR = tempHr

let tempMin = []
for (let i = 0; i < 61; i++) {
  tempMin.push(i)
}
const MIN = tempMin

const defaultSnack = {
  show: false,
  message: 'Save Completed',
  autoHideDuration: 1000,
  severity: 'success',
}

const TimeGuarantee = () => {
  const [modality, setModality] = useState([])
  const [snackWarning, setSnackWarning] = useState(defaultSnack)

  async function getModalities() {
    try {
      const res = await axios.get(API.MODALITIES)
      setModality(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  async function handleUpdate(e, sysId) {
    try {
      const { name, value } = e.target

      const res = await axios.put(
        API.TIME_GUARANTEE,
        { name, value, sysId },
        reqHeader
      )

      if (res.data.data.result) setSnackWarning({ ...defaultSnack, show: true })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getModalities()
  }, [])

  return (
    <div style={{ padding: '8px 15px 0 15px' }}>
      {modality.length > 0 &&
        modality.map(m => (
          <div key={m.MD_CODE}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 80 }}>
                <strong>{m.MD_CODE}</strong>
              </div>
              <div>
                <div style={{ display: 'flex', marginBottom: 5 }}>
                  <div style={{ width: 165 }}>Time Guarantee Alert </div>
                  <div>
                    <select
                      style={{ height: 25 }}
                      onChange={e => handleUpdate(e, m.MD_SYS_ID)}
                      name='MD_TIME_POLICY_HH'
                      defaultValue={
                        modality.find(md => md.MD_CODE === m.MD_CODE)
                          .MD_TIME_POLICY_HH
                      }
                    >
                      {HR.map(hr => (
                        <option key={hr} value={hr}>
                          {hr === 9999999 ? 'Max' : hr}
                        </option>
                      ))}
                    </select>
                    &nbsp; Hr &nbsp;
                    <select
                      onChange={e => handleUpdate(e, m.MD_SYS_ID)}
                      name='MD_TIME_POLICY_MM'
                      style={{ height: 25 }}
                      defaultValue={
                        modality.find(md => md.MD_CODE === m.MD_CODE)
                          .MD_TIME_POLICY_MM
                      }
                    >
                      {MIN.map(min => (
                        <option key={min} value={min}>
                          {min}
                        </option>
                      ))}
                    </select>
                    &nbsp; Min
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 165 }}>Finalize Time Policy </div>
                  <select
                    onChange={e => handleUpdate(e, m.MD_SYS_ID)}
                    name='MD_TIME_FINALIZE_HH'
                    style={{ height: 25 }}
                    defaultValue={
                      modality.find(md => md.MD_CODE === m.MD_CODE)
                        .MD_TIME_FINALIZE_HH
                    }
                  >
                    {HR.map(hr => (
                      <option key={hr} value={hr}>
                        {hr === 9999999 ? 'Max' : hr}
                      </option>
                    ))}
                  </select>
                  &nbsp; Hr &nbsp;
                  <select
                    style={{ height: 25 }}
                    onChange={e => handleUpdate(e, m.MD_SYS_ID)}
                    name='MD_TIME_FINALIZE_MM'
                    defaultValue={
                      modality.find(md => md.MD_CODE === m.MD_CODE)
                        .MD_TIME_FINALIZE_MM
                    }
                  >
                    {MIN.map(min => (
                      <option key={min} value={min}>
                        {min}
                      </option>
                    ))}
                  </select>
                  &nbsp; Min
                </div>
              </div>
            </div>
            <hr />
          </div>
        ))}

      <SnackBarWarning
        snackWarning={snackWarning}
        setSnackWarning={setSnackWarning}
        vertical='top'
        horizontal='center'
      />
    </div>
  )
}

export default TimeGuarantee
