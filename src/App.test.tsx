import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('renders the home page with the main navigation', () => {
    renderAt('/')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Leaving Cert Study Space' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Essay practice' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Backup' })).toBeInTheDocument()
    expect(document.title).toBe('Leaving Cert Study Space')
  })

  it('navigates between pages, updates the title, and moves focus to the content', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Essay practice' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Essay practice' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Essay practice' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(document.title).toBe('Essay practice · Leaving Cert Study Space')
    expect(screen.getByRole('main')).toHaveFocus()

    await user.click(screen.getByRole('link', { name: 'Backup' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Backup' }),
    ).toBeInTheDocument()
  })

  it('shows a way back from unknown routes', () => {
    renderAt('/missing')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Go to the home page' }),
    ).toHaveAttribute('href', '/')
  })
})
