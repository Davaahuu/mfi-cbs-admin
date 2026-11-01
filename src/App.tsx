import { TeamOutlined } from '@ant-design/icons'
import { ErrorComponent, ThemedLayout, ThemedTitle, useNotificationProvider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'
import { Authenticated, Refine } from '@refinedev/core'
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router'
import { App as AntdApp, ConfigProvider } from 'antd'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { accessControlProvider } from './auth/accessControlProvider'
import { authProvider } from './auth/authProvider'
import { CustomerCreate } from './pages/customers/create'
import { CustomerList } from './pages/customers/list'
import { LoginPage } from './pages/login'
import { dataProvider } from './providers/dataProvider'

const Title = ({ collapsed }: { collapsed: boolean }) => <ThemedTitle collapsed={collapsed} text="MFI CBS" />

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider>
        {/* Top centre: clear of the page actions, Create at the top right and Save at the bottom right. */}
        <AntdApp notification={{ placement: 'top' }}>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            accessControlProvider={accessControlProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: 'customers',
                list: '/customers',
                create: '/customers/create',
                meta: { label: 'Customers', icon: <TeamOutlined /> },
              },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true, disableTelemetry: true }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="app" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayout Title={Title}>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="customers" />} />
                <Route path="/customers">
                  <Route index element={<CustomerList />} />
                  <Route path="create" element={<CustomerCreate />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated key="login" fallback={<Outlet />}>
                    <NavigateToResource resource="customers" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}
