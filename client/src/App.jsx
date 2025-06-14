import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { ConfirmProvider } from 'material-ui-confirm'

import Signin from './pages/signin/Signin'
import Registration from './pages/registration/Registration'
import WorklistTabIndex from './pages/worklist/TabIndex'
import worklistTab from './pages/worklist/tab-data'
import PatientInfo from './pages/report/PatientInfo'
import Report from './pages/report/Report'
import ReportTemplate from './pages/report-template/ReportTemplate'
import Teaching from './pages/teaching-files/Teaching'
import ReportSearch from './pages/report-search/Search'

import SystemConfiguration from './pages/system-configuration'
import AllUser from './pages/system-configuration/all-user'
import Order from './pages/system-configuration/order'
import TimeGuarantee from './pages/system-configuration/time-guarantee'
import SystemProperties from './pages/system-configuration/system-properties'
import Feedback from './pages/system-configuration/feedback'

import { APP_CONFIG, APP_ROUTES } from './config'
import DataState from './context/data/DataState'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'

const App = () => {
  const wTabs = worklistTab
  const defaultWorklistRedirect = wTabs[0].link

  return (
    <DataState>
      <ConfirmProvider>
        <CssBaseline />
        <Router>
          <Switch>
            {wTabs.map(tab => (
              <Route key={tab.name} exact path={tab.link}>
                <WorklistTabIndex tabName={tab.name} />
              </Route>
            ))}
            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.worklist}`}
              render={() => <Redirect to={defaultWorklistRedirect} />}
            ></Route>
            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.patientInfo}`}
            >
              <PatientInfo />
            </Route>

            <Route exact path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.report}`}>
              <Report />
            </Route>

            <Route exact path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.signIn}`}>
              <Signin />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.registration}`}
            >
              <Registration />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.reportTemplate}`}
            >
              <ReportTemplate />
            </Route>
            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.teachingFiles}`}
            >
              <Teaching />
            </Route>
            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.reportSearch}`}
            >
              <ReportSearch />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}`}
            >
              <SystemConfiguration />
            </Route>
            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.allUser}`}
            >
              <AllUser />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.order}`}
            >
              <Order />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.timeGuarantee}`}
            >
              <TimeGuarantee />
            </Route>
            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.systemProperties}`}
            >
              <SystemProperties />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}/${APP_ROUTES.systemConfiguration}/${APP_ROUTES.feedback}`}
            >
              <Feedback />
            </Route>

            <Route
              exact
              path={`/${APP_CONFIG.APP_NAME}`}
              render={() => <Redirect to={defaultWorklistRedirect} />}
            ></Route>
            <Route
              exact
              path='/'
              render={() => <Redirect to={defaultWorklistRedirect} />}
            ></Route>
          </Switch>
        </Router>
      </ConfirmProvider>
    </DataState>
  )
}

export default App
