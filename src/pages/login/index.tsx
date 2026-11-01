import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useLogin } from '@refinedev/core'
import { Button, Card, Form, Input, Layout, Typography } from 'antd'
import type { LoginForm } from '../../auth/authProvider'

/** Username and password login; the token from the backend is kept by the auth provider. */
export function LoginPage() {
  const { mutate: login, isPending } = useLogin<LoginForm>()

  return (
    <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 380 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
          MFI CBS Admin
        </Typography.Title>
        <Form<LoginForm> layout="vertical" requiredMark={false} onFinish={(values) => login(values)}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Enter your username' }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            Log in
          </Button>
        </Form>
      </Card>
    </Layout>
  )
}
