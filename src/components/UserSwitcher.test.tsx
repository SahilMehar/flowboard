import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { useFlowStore } from '../store/useFlowStore'

describe('user switcher', () => {
  beforeEach(() => {
    useFlowStore.getState().resetSeed()
  })

  it('hides Marketing when switching from Alice to Bob', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Switch user'), 'user-bob')
    expect(screen.queryByText('Marketing')).not.toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sprint')).toBeInTheDocument()
  })
})
