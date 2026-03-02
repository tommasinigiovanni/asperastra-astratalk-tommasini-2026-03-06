import { useLogin } from '@refinedev/core';
import { Form, Input, Button, Card, Typography, Layout, App } from 'antd';

const { Title } = Typography;

export const LoginPage = () => {
  const { mutate: login, isLoading } = useLogin();
  const { message } = App.useApp();

  const onFinish = (values: { email: string; password: string }) => {
    login(values, {
      onError: () => {
        message.error('Email o password non validi');
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>
          Booking Stampante 3D
        </Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Inserisci una email valida' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Inserisci la password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Accedi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};
