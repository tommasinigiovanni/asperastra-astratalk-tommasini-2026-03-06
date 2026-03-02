import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRefine } from '../helpers';
import { BookingCalendar } from '../../components/calendar/BookingCalendar';

const mockPrinters = [
  { id: 'p1', name: 'Prusa MK4 #1', status: 'active' },
  { id: 'p2', name: 'Prusa MK4 #2', status: 'active' },
];

describe('BookingCalendar', () => {
  it('should render printer selector', async () => {
    renderWithRefine(<BookingCalendar />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Seleziona stampante')).toBeInTheDocument();
    });
  });

  it('should show placeholder when no printer selected', async () => {
    renderWithRefine(<BookingCalendar />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Seleziona una stampante per vedere la disponibilità/),
      ).toBeInTheDocument();
    });
  });

  it('should render date picker and navigation', async () => {
    renderWithRefine(<BookingCalendar />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Seleziona stampante')).toBeInTheDocument();
    });

    // Date picker and navigation buttons should be present
    expect(document.querySelector('.ant-picker')).toBeInTheDocument();
  });
});
