import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import BackupPage from './pages/BackupPage'
import ExportPage from './pages/ExportPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PracticePage from './pages/PracticePage'
import RevisionCalendarPage from './pages/RevisionCalendarPage'
import RevisionPage from './pages/RevisionPage'
import RevisionStudyPage from './pages/RevisionStudyPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="revision" element={<RevisionPage />}>
          <Route index element={<RevisionStudyPage />} />
          <Route path="day/:date" element={<RevisionStudyPage />} />
          <Route path="calendar" element={<RevisionCalendarPage />} />
        </Route>
        <Route path="history" element={<HistoryPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
