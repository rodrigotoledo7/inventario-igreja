import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  },
  getApiErrorMessage: jest.fn(),
}));

test('renders learn react link', () => {
  window.localStorage.clear();
  render(<App />);
  expect(screen.getByText(/inventario patrimonial/i)).toBeInTheDocument();
});
