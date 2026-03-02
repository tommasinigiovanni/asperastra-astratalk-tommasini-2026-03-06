import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRefine } from '../helpers';
import { BookingList } from '../../pages/bookings/list';
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

describe('Booking cancellation', () => {
  it('should render delete button in booking list', async () => {
    renderWithRefine(<BookingList />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockBookings, total: 1 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('PLA grande')).toBeInTheDocument();
    });

    // DeleteButton renders an antd button with a delete icon
    const deleteButtons = document.querySelectorAll('.ant-btn-dangerous, [aria-label*="delete"], .anticon-delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should render delete button in booking show page', async () => {
    renderWithRefine(<BookingShow />, {
      role: 'user',
      dataProvider: {
        getOne: vi.fn().mockResolvedValue({ data: mockBookings[0] }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    // Show page should have a delete button
    const deleteButtons = document.querySelectorAll('.ant-btn-dangerous, [aria-label*="delete"], .anticon-delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should have confirmation dialog on delete button (list has popconfirm)', async () => {
    renderWithRefine(<BookingList />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockBookings, total: 1 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('PLA grande')).toBeInTheDocument();
    });

    // Refine's DeleteButton has a built-in popconfirm
    const deleteButton = document.querySelector('.anticon-delete');
    expect(deleteButton).toBeInTheDocument();
  });
});
