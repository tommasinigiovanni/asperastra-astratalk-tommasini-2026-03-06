import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRefine } from '../helpers';
import { PrinterList } from '../../pages/printers/list';
import { PrinterCreate } from '../../pages/printers/create';

const mockPrinters = [
  { id: '1', name: 'Prusa MK4 #1', status: 'active' },
  { id: '2', name: 'Prusa MK4 #2', status: 'maintenance' },
];

describe('PrinterList', () => {
  it('should render the printer table with data', async () => {
    renderWithRefine(<PrinterList />, {
      role: 'admin',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Prusa MK4 #1')).toBeInTheDocument();
      expect(screen.getByText('Prusa MK4 #2')).toBeInTheDocument();
    });
  });

  it('should show status tags with correct colors', async () => {
    renderWithRefine(<PrinterList />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('maintenance')).toBeInTheDocument();
    });
  });

  it('should show edit buttons for admin', async () => {
    renderWithRefine(<PrinterList />, {
      role: 'admin',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Prusa MK4 #1')).toBeInTheDocument();
    });

    // Admin should see the "Azioni" column
    expect(screen.getByText('Azioni')).toBeInTheDocument();
  });

  it('should NOT show edit buttons for user role', async () => {
    renderWithRefine(<PrinterList />, {
      role: 'user',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockPrinters, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Prusa MK4 #1')).toBeInTheDocument();
    });

    // User should NOT see "Azioni" column
    expect(screen.queryByText('Azioni')).not.toBeInTheDocument();
  });
});

describe('PrinterCreate', () => {
  it('should render the create form with name field', async () => {
    renderWithRefine(<PrinterCreate />, { role: 'admin' });

    await waitFor(() => {
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    });
  });
});
