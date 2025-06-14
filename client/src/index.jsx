import { createRoot } from 'react-dom/client'

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from './pages/report/vfs_fonts'
pdfMake.vfs = pdfFonts

import 'typeface-roboto'

import {
  TahomaRegular,
  TahomaBold,
  TahomaBoldItalic,
  TahomaItalic,
} from './assets/fonts/Tahoma2Base64'

import {
  RobotoItalic64,
  RobotoMediumItalic64,
  RobotoRegular64,
  RobotoMedium64,
} from './assets/fonts/RobotoBase64'

import {
  THSarabunNormal,
  THSarabunItalic,
  THSarabunBold,
  THSarabunBoldItalic,
} from './assets/fonts/THSarabunBase64'

// import t1 from './assets/fonts/Tahoma2/TahomaRegular.ttf'
// import t2 from './assets/fonts/Tahoma2/TahomaBold.ttf'
// import t3 from './assets/fonts/Tahoma2/TahomaItalic.ttf'
// import t4 from './assets/fonts/Tahoma2/TahomaBoldItalic.ttf'

// import images1 from './assets/img/line3.jpg'
// import images2 from './assets/img/sskh_report_header.jpg'
// import { getBase64FromUrl } from './utils'

import App from './App'

async function setup() {
  // const a1 = await getBase64FromUrl(t1)
  // const a2 = await getBase64FromUrl(t2)
  // const a3 = await getBase64FromUrl(t3)
  // const a4 = await getBase64FromUrl(t4)
  // console.log(a1.split('base64,')[1])
  // console.log(a2.split('base64,')[1])
  // console.log(a3.split('base64,')[1])
  // console.log(a4.split('base64,')[1])

  // const b = await getBase64FromUrl(images1)
  // console.log(b)
  // const c = await getBase64FromUrl(images2)
  // console.log(c)

  // pdfMake.vfs['ArialNormal.ttf'] = ArialNormal
  // pdfMake.vfs['ArialBold.ttf'] = ArialBold
  // pdfMake.vfs['ArialBoldItalic.ttf'] = ArialBoldItalic
  // pdfMake.vfs['ArialItalic.ttf'] = ArialItalic

  pdfMake.vfs['TahomaRegular.ttf'] = TahomaRegular
  pdfMake.vfs['TahomaBold.ttf'] = TahomaBold
  pdfMake.vfs['TahomaBoldItalic.ttf'] = TahomaBoldItalic
  pdfMake.vfs['TahomaItalic.ttf'] = TahomaItalic

  pdfMake.vfs['THSarabanNormal.ttf'] = THSarabunNormal
  pdfMake.vfs['THSarabanBold.ttf'] = THSarabunBold
  pdfMake.vfs['THSarabanItalic.ttf'] = THSarabunItalic
  pdfMake.vfs['THSarabanBoldItalic.ttf'] = THSarabunBoldItalic

  pdfMake.vfs['RobotoRegular.ttf'] = RobotoRegular64
  pdfMake.vfs['RobotoMedium.ttf'] = RobotoMedium64
  pdfMake.vfs['RobotoItalic.ttf'] = RobotoItalic64
  pdfMake.vfs['RobotoMediumItalic.ttf'] = RobotoMediumItalic64

  pdfMake.fonts = {
    // Arial: {
    //   normal: 'ArialNormal.ttf',
    //   bold: 'ArialBold.ttf',
    //   italics: 'ArialItalic.ttf',
    //   bolditalics: 'ArialBoldItalic.ttf'
    // },
    Tahoma: {
      normal: 'TahomaRegular.ttf',
      bold: 'TahomaBold.ttf',
      italics: 'TahomaItalic.ttf',
      bolditalics: 'TahomaBoldItalic.ttf',
    },
    THSaraban: {
      normal: 'THSarabanNormal.ttf',
      bold: 'THSarabanBold.ttf',
      italics: 'THSarabanItalic.ttf',
      bolditalics: 'THSarabanBoldItalic.ttf',
    },
    Roboto: {
      normal: 'RobotoRegular.ttf',
      bold: 'RobotoMedium.ttf',
      italics: 'RobotoItalic.ttf',
      bolditalics: 'RobotoMediumItalic.ttf',
    },
  }
}

setup()
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)

/*
find Editor.prototype.getScriptSrc in 
\client\node_modules\@tinymce\tinymce-react\lib\es2015\main\ts\components
\client\node_modules\@tinymce\tinymce-react\lib\cjs\main\ts\components

replace in both Editor.js function with this

return '/js/tinymce.min.js'

*/
