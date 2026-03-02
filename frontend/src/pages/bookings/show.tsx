import { Show, DateField, TextField } from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import { Typography } from 'antd';

const { Title } = Typography;

export const BookingShow = () => {
  const { query } = useShow({ resource: 'bookings' });
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
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
