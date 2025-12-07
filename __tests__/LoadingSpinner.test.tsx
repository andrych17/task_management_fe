import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('has spinning animation class', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    const spinnerElement = spinner.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
  });
});
