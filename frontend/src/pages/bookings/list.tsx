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
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
