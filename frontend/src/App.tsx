import { Refine, Authenticated, AccessControlProvider } from '@refinedev/core';
import { ThemedLayoutV2, useNotificationProvider } from '@refinedev/antd';
import routerProvider, { NavigateToResource, CatchAllNavigate } from '@refinedev/react-router';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router';
import { App as AntdApp, ConfigProvider } from 'antd';
import { PrinterOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import '@refinedev/antd/dist/reset.css';

import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { LoginPage } from './pages/login';
import { PrinterList } from './pages/printers/list';
import { PrinterCreate } from './pages/printers/create';
import { PrinterEdit } from './pages/printers/edit';
import { BookingList } from './pages/bookings/list';
import { BookingCreate } from './pages/bookings/create';
import { BookingShow } from './pages/bookings/show';
import { UserList } from './pages/users/list';
import { UserCreate } from './pages/users/create';
import { BookingCalendarPage } from './pages/bookings/calendar';

const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role;

    // Users resource: admin only
    if (resource === 'users') {
      return { can: role === 'admin' };
    }

    // Printer create/edit: admin only
    if (resource === 'printers' && (action === 'create' || action === 'edit')) {
      return { can: role === 'admin' };
    }

    return { can: true };
  },
};

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={{ default: dataProvider }}
            authProvider={authProvider}
            notificationProvider={useNotificationProvider}
            accessControlProvider={accessControlProvider}
            resources={[
              {
                name: 'printers',
                list: '/printers',
                create: '/printers/create',
                edit: '/printers/edit/:id',
                meta: { icon: <PrinterOutlined /> },
              },
              {
                name: 'bookings',
                list: '/bookings',
                create: '/bookings/create',
                show: '/bookings/show/:id',
                meta: { icon: <CalendarOutlined /> },
              },
              {
                name: 'users',
                list: '/users',
                create: '/users/create',
                meta: { icon: <TeamOutlined /> },
              },
            ]}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="auth" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2 Title={() => <span>FabLab Booking</span>}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="printers" />} />
                <Route path="/printers" element={<PrinterList />} />
                <Route path="/printers/create" element={<PrinterCreate />} />
                <Route path="/printers/edit/:id" element={<PrinterEdit />} />
                <Route path="/bookings" element={<BookingList />} />
                <Route path="/bookings/create" element={<BookingCreate />} />
                <Route path="/bookings/show/:id" element={<BookingShow />} />
                <Route path="/bookings/calendar" element={<BookingCalendarPage />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/users/create" element={<UserCreate />} />
              </Route>
              <Route
                element={
                  <Authenticated key="noauth" fallback={<Outlet />}>
                    <NavigateToResource resource="printers" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
