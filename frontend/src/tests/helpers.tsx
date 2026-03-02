import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/react-router';
import { BrowserRouter } from 'react-router';
import type { AuthProvider, DataProvider } from '@refinedev/core';

interface WrapperOptions {
  role?: string;
  dataProvider?: Partial<DataProvider>;
}

const emptyFn = () => Promise.resolve({ data: [] as unknown[], total: 0 });

function createMockDataProvider(overrides: Partial<DataProvider> = {}): DataProvider {
  return {
    getList: overrides.getList ?? (() => Promise.resolve({ data: [], total: 0 })),
    getOne: overrides.getOne ?? (() => Promise.resolve({ data: {} })),
    create: overrides.create ?? (() => Promise.resolve({ data: {} })),
    update: overrides.update ?? (() => Promise.resolve({ data: {} })),
    deleteOne: overrides.deleteOne ?? (() => Promise.resolve({ data: {} })),
    getApiUrl: () => 'http://localhost:3000/api',
    ...overrides,
  } as DataProvider;
}

function createMockAuthProvider(role = 'user'): AuthProvider {
  return {
    login: async () => ({ success: true }),
    logout: async () => ({ success: true }),
    check: async () => ({ authenticated: true }),
    getIdentity: async () => ({ id: '1', name: 'Test', email: 'test@test.it', role }),
    getPermissions: async () => role,
    onError: async () => ({}),
  };
}

export function renderWithRefine(
  ui: React.ReactElement,
  options: WrapperOptions & { renderOptions?: Omit<RenderOptions, 'wrapper'> } = {},
) {
  const { role = 'user', dataProvider: dpOverrides, renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <Refine
        routerProvider={routerProvider}
        dataProvider={{ default: createMockDataProvider(dpOverrides) }}
        authProvider={createMockAuthProvider(role)}
        resources={[
          { name: 'printers', list: '/printers', create: '/printers/create', edit: '/printers/edit/:id' },
          { name: 'bookings', list: '/bookings', create: '/bookings/create', show: '/bookings/show/:id' },
          { name: 'users', list: '/users', create: '/users/create' },
        ]}
      >
        {children}
      </Refine>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
