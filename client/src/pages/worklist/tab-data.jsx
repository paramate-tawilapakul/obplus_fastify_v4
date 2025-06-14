import NewWorklist from './tabs/New'
import Prelim from './tabs/Prelim'
import Verified from './tabs/Verified'
// import Favorite from './tabs/Favorite'

import { APP_CONFIG, APP_ROUTES } from '../../config'

/*
*** IMPORTANT RULES ***
 DO NOT CHANGE VALUE OF (component ---tabName---)
 USE FOR MANY FUNCTION AND API REQUEST
*/

let tabs = [
  {
    name: 'New',
    id: 'new',
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}/new`,
    component: <NewWorklist tabName='new' />,
    show: true,
  },
  {
    name: 'Prelim',
    id: 'prelim',
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}/prelim`,
    component: <Prelim tabName='prelim' />,
    show: true,
  },
  {
    name: 'Verified',
    id: 'verified',
    link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}/verified`,
    component: <Verified tabName='verified' />,
    show: true,
  },
  // {
  //   name: 'Favorite',
  //   id: 'favorite',
  //   link: `/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}/favorite`,
  //   component: <Favorite tabName='favorite' />,
  //   show: true,
  // },
]

export default tabs
