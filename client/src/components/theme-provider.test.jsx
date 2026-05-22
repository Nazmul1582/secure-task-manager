import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from './theme-provider'

vi.mock('next-themes', () => ({
  ThemeProvider: vi.fn(({ children, defaultTheme, enableSystem }) => (
    <div data-default-theme={defaultTheme} data-enable-system={String(enableSystem)}>
      {children}
    </div>
  )),
}))

describe('ThemeProvider', () => {
  it('uses dark as the default theme without following the system theme', () => {
    const { getByText } = render(
      <ThemeProvider>
        <span>Child app</span>
      </ThemeProvider>,
    )

    const provider = getByText('Child app').parentElement

    expect(provider).toHaveAttribute('data-default-theme', 'dark')
    expect(provider).toHaveAttribute('data-enable-system', 'false')
  })
})
