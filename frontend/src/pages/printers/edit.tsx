import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

export const PrinterEdit = () => {
  const { formProps, saveButtonProps } = useForm({ resource: 'printers' });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Nome" name="name">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Stato"
          name="status"
          rules={[{ required: true, message: 'Seleziona uno stato' }]}
        >
          <Select
            options={[
              { label: 'Attiva', value: 'active' },
              { label: 'Manutenzione', value: 'maintenance' },
            ]}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
