import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Trading App', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('should render trading interface', () => {
    expect(screen.getByText('QuantumTrade Pro')).toBeDefined();
    expect(screen.getByText('Trading')).toBeDefined();
  });

  it('should handle buy order', () => {
    const input = screen.getByLabelText('Amount (BTC)');
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByText('Buy'));
    expect(screen.getByText('BUY')).toBeDefined();
  });

  it('should show error for invalid amount', () => {
    const input = screen.getByLabelText('Amount (BTC)');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByText('Buy'));
    expect(screen.getByText('Invalid amount')).toBeDefined();
  });
});