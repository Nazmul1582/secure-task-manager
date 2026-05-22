import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, useI18n } from './i18n'

function LanguageProbe() {
  const { language, setLanguage, t } = useI18n()

  return (
    <div>
      <p>{language}</p>
      <p>{t('settings')}</p>
      <button type="button" onClick={() => setLanguage('bn')}>
        switch
      </button>
    </div>
  )
}

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.removeItem('secureTaskManager.language')
  })

  it('switches language and persists the selection', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /switch/i }))

    expect(screen.getByText('bn')).toBeInTheDocument()
    expect(screen.getByText('সেটিংস')).toBeInTheDocument()
    expect(setItem).toHaveBeenCalledWith('secureTaskManager.language', 'bn')
  })
})
