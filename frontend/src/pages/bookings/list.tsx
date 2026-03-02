import { List, useTable, ShowButton, DeleteButton, DateField } from '@refinedev/antd';
import { usePermissions } from '@refinedev/core';
import { Table, Space } from 'antd';

export const BookingList = () => {
  const { tableProps } = useTable({ resource: 'bookings' });
  const { data: role } = usePermissions<string>();

  return (
    <List canCreate>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="printerId" title="Stampante ID" />
        <Table.Column
          dataIndex="startTime"
          title="Inizio"
          render={(value: string) => <DateField value={value} format="DD/MM/YYYY HH:mm" />}
        />
        <Table.Column
          dataIndex="endTime"
          title="Fine"
          render={(value: string) => <DateField value={value} format="DD/MM/YYYY HH:mm" />}
        />
        <Table.Column dataIndex="notes" title="Note" />
        {role === 'admin' && (
          <Table.Column dataIndex="userId" title="Utente ID" />
        )}
        <Table.Column
          title="Azioni"
          render={(_, record: { id: string }) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
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
        />
      </Table>
    </List>
  );
};
