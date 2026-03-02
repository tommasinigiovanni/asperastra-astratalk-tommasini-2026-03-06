import { Create, useForm } from '@refinedev/antd';
import { Form, Input } from 'antd';

export const PrinterCreate = () => {
  const { formProps, saveButtonProps } = useForm({ resource: 'printers' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Nome"
          name="name"
          rules={[{ required: true, message: 'Il nome è obbligatorio' }]}
        >
          <Input placeholder="es. Prusa MK4 #3" />
        </Form.Item>
      </Form>
    </Create>
  );
};
