import { List, useTable, TagField, DateField } from '@refinedev/antd';
import { Table } from 'antd';

export const UserList = () => {
  const { tableProps } = useTable({ resource: 'users' });

  return (
    <List canCreate>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Nome" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex="role"
          title="Ruolo"
          render={(value: string) => (
            <TagField value={value} color={value === 'admin' ? 'red' : 'blue'} />
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Creato il"
          render={(value: string) => <DateField value={value} format="DD/MM/YYYY" />}
        />
      </Table>
    </List>
  );
};
