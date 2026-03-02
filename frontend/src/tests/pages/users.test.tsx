import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRefine } from '../helpers';
import { UserList } from '../../pages/users/list';
import { UserCreate } from '../../pages/users/create';

const mockUsers = [
  {
    id: 'u1',
    name: 'Mario Rossi',
    email: 'mario@fablab.it',
    role: 'user',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'Admin Staff',
    email: 'admin@asperastra.it',
    role: 'admin',
    createdAt: '2026-03-01T09:00:00Z',
  },
];

describe('UserList', () => {
  it('should render the user table with name, email, role columns', async () => {
    renderWithRefine(<UserList />, {
      role: 'admin',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockUsers, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
      expect(screen.getByText('mario@fablab.it')).toBeInTheDocument();
      expect(screen.getByText('Admin Staff')).toBeInTheDocument();
    });
  });

  it('should display role as tag', async () => {
    renderWithRefine(<UserList />, {
      role: 'admin',
      dataProvider: {
        getList: vi.fn().mockResolvedValue({ data: mockUsers, total: 2 }),
      },
    });

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });
  });
});

describe('UserCreate', () => {
  it('should render the create form with all required fields', async () => {
    renderWithRefine(<UserCreate />, { role: 'admin' });

    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Ruolo')).toBeInTheDocument();
    });
  });
});
