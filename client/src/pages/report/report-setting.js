import { calculateAge, convertDateTimeFormat } from '../../utils'

const lineProps = {
  type: 'line',
  lineWidth: 0.5,
  x1: 0,
  //   x2: 502,
  x2: 538,
  y1: 0,
  y2: 0,
  lineColor: '#000000',
}

//RVH
export const getReportConfigTemplate1 = data => {
  const patientInfo = data.patient
  // console.log('patientInfo', patientInfo)
  // console.log('timestampReported', data.timestampReported)

  const contentMarginTop = 147

  return {
    pageMargins: [30, contentMarginTop, 30, 40],
    header: [
      {
        canvas: [lineProps],
        margin: [28, 10, 28, 3],
      },
      {
        text: [
          {
            text: 'Patient Informations ',
            style: 'defaultSmallerFont',
            bold: true,
          },
        ],
        marginLeft: 31,
      },
      {
        margin: [30, 0, 30, 1],
        columns: [
          {
            width: 90,
            text: `HN: ${patientInfo.hn}`,
            style: 'defaultSmallFont',
            marginLeft: 1,
          },
          {
            width: '*',
            text: `Name: ${patientInfo.name}  ${calculateAge(
              patientInfo.birthDate,
              data.timestampReported?.slice(0, 8) || ''
            )}`,
            style: 'defaultSmallerFont',
            bold: true,
            alignment: 'center',
          },
          {
            width: 136,
            text: `Date: ${convertDateTimeFormat(
              patientInfo.triggerDttm.slice(0, 8) +
                ' ' +
                patientInfo.triggerDttm.slice(8),
              'D MMM YYYY HH:mm'
            )}`,
            style: 'defaultSmallFont',
            alignment: 'right',
          },
        ],
      },

      {
        canvas: [lineProps],
        margin: [28, 0, 28, 0],
      },
    ],
  }
}

export const reportByTemplate1 = ({
  status,
  consultDoctor,
  reportedDoctor,
  verifiedDoctor,
  timestampReported,
  type,
}) => {
  // console.log('reportedDoctor', reportedDoctor)
  // console.log('verifiedDoctor', verifiedDoctor)
  let result = []

  if (consultDoctor.length > 0) {
    result.push({
      text: [
        {
          text: `Consultant By : `,
          style: 'defaultFont',
        },
        {
          text: consultDoctor
            .map(c => `${c.radDesc?.replace(/\s+/g, ' ')} (${c.radName})`)
            .join(', '),
          style: 'defaultFont',
        },
      ],
      margin: [0, 20, 0, 0],
    })
  }

  result.push({
    text: [
      {
        text: `Reported By : `,
        style: 'defaultFont',
      },
      {
        text: reportedDoctor?.replace(/\s+/g, ' '),
        style: 'defaultFont',
      },
    ],
    margin: [0, consultDoctor.length === 0 ? 20 : 0, 0, 0],
  })

  // show only click Verified
  // console.log(type, status)
  if (
    type === 'verify' ||
    (status === 'R' && ['preview', 'worklist'].includes(type))
  ) {
    result.push({
      text: [
        {
          text: `Verified By : `,
          style: 'defaultFont',
        },
        {
          text: verifiedDoctor?.replace(/\s+/g, ' '),
          style: 'defaultFont',
        },
      ],
      margin: [0, 0, 0, 0],
    })
  }

  result.push({
    text: `Report Time : ${convertDateTimeFormat(
      timestampReported.slice(0, 8) + ' ' + timestampReported.slice(8),
      'D MMM YYYY - HH:mm'
    )}`,
    style: 'defaultFont',
    // bold: true
  })

  return result
}
