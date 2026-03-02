import { Create, useForm, useSelect } from '@refinedev/antd';
import { Form, Select, DatePicker, Input } from 'antd';
import dayjs from 'dayjs';

export const BookingCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'bookings',
    errorNotification: (error) => {
      const status = (error as { statusCode?: number })?.statusCode;
      if (status === 409) {
        return { message: 'Slot già occupato', description: 'La prenotazione si sovrappone a una esistente', type: 'error' };
      }
      if (status === 400) {
        return { message: 'Errore di validazione', description: String((error as { message?: string })?.message ?? 'Dati non validi'), type: 'error' };
      }
      return { message: 'Errore', description: 'Operazione non riuscita', type: 'error' };
    },
  });

  const { selectProps: printerSelectProps } = useSelect({
    resource: 'printers',
    optionLabel: 'name',
    optionValue: 'id',
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values: Record<string, unknown>) => {
          const data = {
            printerId: values.printerId,
            startTime: (values.startTime as dayjs.Dayjs).toISOString(),
            endTime: (values.endTime as dayjs.Dayjs).toISOString(),
            notes: (values.notes as string) ?? '',
          };
          return formProps.onFinish?.(data);
        }}
      >
        <Form.Item
          label="Stampante"
          name="printerId"
          rules={[{ required: true, message: 'Seleziona una stampante' }]}
        >
          <Select {...printerSelectProps} placeholder="Seleziona stampante" />
        </Form.Item>
        <Form.Item
          label="Inizio"
          name="startTime"
          rules={[{ required: true, message: 'Seleziona data e ora di inizio' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label="Fine"
          name="endTime"
          rules={[{ required: true, message: 'Seleziona data e ora di fine' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>
        <Form.Item label="Note" name="notes">
          <Input.TextArea rows={3} placeholder="es. stampa PLA grande" />
        </Form.Item>
      </Form>
    </Create>
  );
};
