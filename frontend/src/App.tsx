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

// Placeholder pages — will be implemented in Steps 11-14
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
                <Route path="/printers" element={<PlaceholderPage title="Stampanti" />} />
                <Route path="/printers/create" element={<PlaceholderPage title="Nuova Stampante" />} />
                <Route path="/printers/edit/:id" element={<PlaceholderPage title="Modifica Stampante" />} />
                <Route path="/bookings" element={<PlaceholderPage title="Prenotazioni" />} />
                <Route path="/bookings/create" element={<PlaceholderPage title="Nuova Prenotazione" />} />
                <Route path="/bookings/show/:id" element={<PlaceholderPage title="Dettaglio Prenotazione" />} />
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
