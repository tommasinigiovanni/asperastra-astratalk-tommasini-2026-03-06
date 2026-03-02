import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm({ resource: 'users' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Nome"
          name="name"
          rules={[{ required: true, message: 'Inserisci il nome' }]}
        >
          <Input placeholder="es. Mario Rossi" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Inserisci l\'email' },
            { type: 'email', message: 'Email non valida' },
          ]}
        >
          <Input placeholder="es. mario@fablab.it" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Inserisci la password' },
            { min: 8, message: 'Minimo 8 caratteri' },
          ]}
        >
          <Input.Password placeholder="Minimo 8 caratteri" />
        </Form.Item>
        <Form.Item
          label="Ruolo"
          name="role"
          initialValue="user"
          rules={[{ required: true, message: 'Seleziona un ruolo' }]}
        >
          <Select
            options={[
              { label: 'User', value: 'user' },
              { label: 'Admin', value: 'admin' },
            ]}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
