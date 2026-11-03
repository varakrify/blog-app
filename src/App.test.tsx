import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  ) as jest.Mock;
});

test('renders the post list', async () => {
  render(<App />);
  expect(await screen.findByText(/latest posts/i)).toBeInTheDocument();
});
