import { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import PrintIcon from '@mui/icons-material/Print'
import { Document, Page, pdfjs } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = `//${window.location.host}/js/pdf.worker.min.js`
import printJS from 'print-js'

import '../../pages/report/style.css'
import { APP_ROUTES } from '../../config'
import { sleep } from '../../utils'

export default function ViewPDF({
  status,
  pdfDataUrl,
  setPdfDataUrl,
  systemProperties,
  page,
}) {
  const history = useHistory()
  const [numPages, setNumPages] = useState(null)
  // const [pageNumber, setPageNumber] = useState(1)

  const previewReportRef = useRef(null)
  const btCloseRef = useRef(null)
  const btPrintRef = useRef(null)

  function handleClosePreview() {
    const targetElement = previewReportRef.current
    targetElement.classList.toggle('d-none')
    setPdfDataUrl(null)
    setNumPages(null)
    // setPageNumber(1)
  }

  function handlePrintPreview() {
    const base64 = pdfDataUrl.replace('data:', '').replace(/^.+,/, '')
    printJS({ printable: base64, type: 'pdf', base64: true })

    toggleView()
    setPdfDataUrl(null)
    setNumPages(null)
    // setPageNumber(1)

    if (page === 'report' && systemProperties.appMode === 'production')
      history.push(`${APP_ROUTES.worklist}`)
  }

  function onDocumentLoadSuccess({ numPages }) {
    sleep(50).then(() => {
      const bt = btCloseRef.current
      bt?.classList.remove('d-none')
      const btp = btPrintRef.current
      btp?.classList.remove('d-none')
    })

    setNumPages(numPages)
  }

  function toggleView() {
    const targetElement = previewReportRef.current
    targetElement.classList.toggle('d-none')
  }

  useEffect(() => {
    if (pdfDataUrl) toggleView()
  }, [pdfDataUrl])

  return (
    <div
      className='preview-report d-none mb-10'
      ref={previewReportRef}
      onClick={handleClosePreview}
    >
      <div className='iframe-view' onClick={e => e.stopPropagation()}>
        {pdfDataUrl && (
          <div>
            <Document
              file={pdfDataUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={() => (
                <div className='generating-pdf'>
                  <Typography variant='h3' sx={{ color: 'white' }}>
                    Generating...
                  </Typography>
                </div>
              )}
            >
              {/* <Page width={790} pageNumber={pageNumber} /> */}
              {Array.apply(null, Array(numPages))
                .map((x, i) => i + 1)
                .map(page => (
                  <div key={page}>
                    <Page width={790} pageNumber={page} />
                    <div
                      style={{ backgroundColor: '#090909', height: 7 }}
                    ></div>
                  </div>
                ))}
            </Document>
            {/* {numPages && numPages > 1 && (
            <>
              <div className='btn-pdf-container'>
                <button
                  style={{ marginRight: 5 }}
                  className={`btn-pdf ${pageNumber === 1 && 'd-none'}`}
                  onClick={e => {
                    e.stopPropagation()
                    const nn = pageNumber - 1
                    setPageNumber(nn)
                  }}
                >
                  <Typography
                    variant='body2'
                    component='span'
                    sx={{ color: 'black' }}
                  >
                    &#706;&nbsp;Previous
                  </Typography>
                </button>

                <button
                  className={`btn-pdf ${pageNumber === numPages && 'd-none'
                    }`}
                  onClick={e => {
                    e.stopPropagation()
                    const nn = pageNumber + 1
                    setPageNumber(nn)
                  }}
                >
                  <Typography
                    variant='body2'
                    component='span'
                    sx={{ color: 'black' }}
                  >
                    Next&nbsp;&#707;
                  </Typography>
                </button>
              </div>
            </>
          )} */}
          </div>
        )}
        {pdfDataUrl && (
          <div style={{ position: 'sticky', top: 5 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                ref={btCloseRef}
                title='Close'
                className='iframe-bt-close d-none'
                onClick={e => {
                  e.stopPropagation()
                  handleClosePreview()
                }}
              >
                X
              </button>
              {status !== 'N' && (
                <button
                  ref={btPrintRef}
                  title='Print'
                  className='iframe-bt-print d-none'
                  onClick={e => {
                    e.stopPropagation()
                    handlePrintPreview()
                  }}
                >
                  <PrintIcon fontSize='large' />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
