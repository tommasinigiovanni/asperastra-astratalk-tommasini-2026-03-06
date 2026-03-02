import { Refine, Authenticated } from '@refinedev/core';
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

// Placeholder pages — will be implemented in Steps 13-14
const PlaceholderPage = ({ title }: { title: string }) => <div>{title}</div>;

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
                <Route path="/bookings/calendar" element={<PlaceholderPage title="Calendario" />} />
                <Route path="/users" element={<PlaceholderPage title="Utenti" />} />
                <Route path="/users/create" element={<PlaceholderPage title="Nuovo Utente" />} />
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
