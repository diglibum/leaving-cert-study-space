import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

const navigation = [
  { to: '/', label: 'Home', end: true },
  { to: '/revision', label: 'Revision', end: false },
  { to: '/practice', label: 'Essay practice', end: false },
  { to: '/history', label: 'Essay history', end: false },
  { to: '/export', label: 'Essay AI export', end: false },
  { to: '/backup', label: 'Backup', end: false },
]

function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const previousPathname = useRef(pathname)

  // Move focus to the page content after in-app navigation so keyboard and
  // screen reader users do not stay on the link they activated.
  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    mainRef.current?.focus()
  }, [pathname])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <p className="brand">
          <span className="brand-mark" aria-hidden="true">L</span>
          Leaving Cert Study Space
        </p>
        <nav aria-label="Main">
          <ul className="site-nav">
            {navigation.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <span className="status-label">Saved on this device</span>
      </header>

      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          Your plan, progress and writing are saved only in this browser. Download a backup regularly from the Backup
          page.
        </p>
        <p>
          The revision topics, questions and practice problems were written with AI and have not been checked by a
          teacher. Check them against your class notes and the official SEC and NCCA material. Unofficial, not affiliated with the SEC or
          NCCA.
        </p>
        <p>
          Testing the app? Share ideas and problems in the{' '}
          <a href="https://t.me/+_Cf8xQ0d6rxjYzRi" target="_blank" rel="noopener noreferrer">
            feedback chat on Telegram
          </a>
          .
        </p>
      </footer>
    </div>
  )
}

export default Layout
