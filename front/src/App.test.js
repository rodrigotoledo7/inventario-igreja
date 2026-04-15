import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
    },
  },
  getApiErrorMessage: vi.fn(),
}));

test('renders learn react link', () => {
  window.localStorage.clear();
  render(<App />);
  expect(screen.getByText(/inventario patrimonial/i)).toBeInTheDocument();
});
