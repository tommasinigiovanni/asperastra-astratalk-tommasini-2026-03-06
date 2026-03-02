import { Show, DateField, TextField, DeleteButton } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography, Space } from 'antd';

const { Title } = Typography;

export const BookingShow = () => {
  const { query } = useShow({ resource: 'bookings' });
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show
      isLoading={isLoading}
      headerButtons={({ defaultButtons }) => (
        <Space>
          {defaultButtons}
          <DeleteButton
            recordItemId={record?.id}
            errorNotification={(error) => {
              const status = (error as { statusCode?: number })?.statusCode;
              if (status === 409) {
                return { message: 'Troppo tardi', description: 'Non puoi cancellare a meno di 15 minuti dall\'inizio', type: 'error' };
              }
              if (status === 403) {
                return { message: 'Non autorizzato', description: 'Non puoi cancellare questa prenotazione', type: 'error' };
              }
              return { message: 'Errore', description: 'Cancellazione non riuscita', type: 'error' };
            }}
            successNotification={{ message: 'Prenotazione cancellata', description: 'La prenotazione è stata rimossa', type: 'success' }}
          />
        </Space>
      )}
    >
      <Title level={5}>Stampante ID</Title>
      <TextField value={record?.printerId} />

      <Title level={5}>Utente ID</Title>
      <TextField value={record?.userId} />

      <Title level={5}>Inizio</Title>
      {record?.startTime && <DateField value={record.startTime} format="DD/MM/YYYY HH:mm" />}

      <Title level={5}>Fine</Title>
      {record?.endTime && <DateField value={record.endTime} format="DD/MM/YYYY HH:mm" />}

      <Title level={5}>Note</Title>
      <TextField value={record?.notes || '—'} />

      <Title level={5}>Creata il</Title>
      {record?.createdAt && <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />}
    </Show>
  );
};
