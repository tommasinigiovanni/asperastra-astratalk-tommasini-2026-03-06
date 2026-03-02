import { List, useTable, EditButton, TagField } from '@refinedev/antd';
import { usePermissions } from '@refinedev/core';
import { Table, Space } from 'antd';

export const PrinterList = () => {
  const { tableProps } = useTable({ resource: 'printers' });
  const { data: role } = usePermissions<string>();

  return (
    <List canCreate={role === 'admin'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Nome" />
        <Table.Column
          dataIndex="status"
          title="Stato"
          render={(value: string) => (
            <TagField
              value={value}
              color={value === 'active' ? 'green' : 'orange'}
            />
          )}
        />
        {role === 'admin' && (
          <Table.Column
            title="Azioni"
            render={(_, record: { id: string }) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.id} />
              </Space>
            )}
          />
        )}
      </Table>
    </List>
  );
};
