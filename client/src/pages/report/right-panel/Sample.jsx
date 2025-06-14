import { useEffect, useState } from 'react'
import axios from 'axios'
import parse from 'html-react-parser'

import { API } from '../../../config'
import { createHtml } from '../report-utils'

function Sample({ patient }) {
  const [report, setReport] = useState(null)

  async function getReport() {
    const res = await axios.get(API.REPORT_DATA, {
      params: {
        accession: patient.accession,
        studyType: patient.obStudyType,
      },
    })

    let reportContent = res.data.data.reportContent
    let reportTemplate = res.data.data.reportTemplate
    // console.log(reportContent)
    // console.log(reportTemplate)

    let content = createHtml(
      reportTemplate,
      patient.obStudyType,
      patient.noFetus
    )

    setReport([reportContent, content])
  }

  useEffect(() => {
    getReport()
    // eslint-disable-next-line
  }, [])

  return <>{report && report.map((r, i) => <div key={i}>{parse(r)}</div>)}</>
}

export default Sample
