import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRefine } from '../helpers';
import { BookingList } from '../../pages/bookings/list';
import { BookingCreate } from '../../pages/bookings/create';
import { BookingShow } from '../../pages/bookings/show';

const mockBookings = [
  {
    id: 'b1',
    printerId: 'p1',
    userId: 'u1',
    startTime: '2026-04-01T10:00:00Z',
    endTime: '2026-04-01T12:00:00Z',
    notes: 'PLA grande',
    createdAt: '2026-04-01T09:00:00Z',
  },
];

describe('BookingList', () => {
  it('should render the booking table', async () => {
    renderWithRefine(<BookingList />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockBookings, total: 1 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('PLA grande')).toBeInTheDocument();
    });
  });

  it('should show userId column for admin', async () => {
    renderWithRefine(<BookingList />, {
      role: 'admin',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockBookings, total: 1 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Utente ID')).toBeInTheDocument();
    });
  });

  it('should NOT show userId column for user', async () => {
    renderWithRefine(<BookingList />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockBookings, total: 1 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('PLA grande')).toBeInTheDocument();
    });

    expect(screen.queryByText('Utente ID')).not.toBeInTheDocument();
  });
});

describe('BookingCreate', () => {
  it('should render the create form with required fields', async () => {
    renderWithRefine(<BookingCreate />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Stampante')).toBeInTheDocument();
      expect(screen.getByText('Inizio')).toBeInTheDocument();
      expect(screen.getByText('Fine')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();
    });
  });
});

describe('BookingShow', () => {
  it('should render booking details', async () => {
    renderWithRefine(<BookingShow />, {
      role: 'user',
      dataProvider: {
        getOne: vi.fn().mockResolvedValue({ data: mockBookings[0] }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Stampante ID')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();
    });
  });
});
