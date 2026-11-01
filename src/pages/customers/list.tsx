import { DateField, List, useTable } from '@refinedev/antd'
import { Table, Tag } from 'antd'
import type { Customer } from '../../providers/dataProvider'

const STATUS_COLOR = { ACTIVE: 'green', BLACKLISTED: 'red', CLOSED: 'default' } as const
const KYC_COLOR = { PENDING: 'gold', VERIFIED: 'green', REJECTED: 'red' } as const

function displayName(customer: Customer): string {
  return customer.kind === 'INDIVIDUAL'
    ? `${customer.name?.givenName ?? ''} ${customer.name?.familyName ?? ''}`.trim()
    : (customer.name ?? '')
}

/** Every customer, newest first, a page at a time; the backend does the paging. */
export function CustomerList() {
  const { tableProps } = useTable<Customer>({
    resource: 'customers',
    pagination: { pageSize: 20 },
    // The API has no sorting or filtering yet.
    sorters: { mode: 'off' },
    filters: { mode: 'off' },
    syncWithLocation: true,
  })

  return (
    <List>
      <Table<Customer> {...tableProps} rowKey="id">
        <Table.Column<Customer> title="Name" render={(_, customer) => displayName(customer)} />
        <Table.Column<Customer>
          dataIndex="kind"
          title="Type"
          render={(kind: Customer['kind']) => (kind === 'INDIVIDUAL' ? 'Individual' : 'Group')}
        />
        <Table.Column<Customer>
          title="Identity document"
          render={(_, customer) =>
            customer.kind === 'INDIVIDUAL' && customer.identity
              ? `${customer.identity.number} (${customer.identity.issuingCountry})`
              : '—'
          }
        />
        <Table.Column<Customer>
          title="Phone"
          render={(_, customer) => (customer.kind === 'INDIVIDUAL' ? customer.phone : '—')}
        />
        <Table.Column<Customer>
          title="KYC"
          render={(_, customer) =>
            customer.kind === 'INDIVIDUAL' && customer.kyc?.status ? (
              <Tag color={KYC_COLOR[customer.kyc.status]}>{customer.kyc.status}</Tag>
            ) : (
              '—'
            )
          }
        />
        <Table.Column<Customer>
          dataIndex="status"
          title="Status"
          render={(status: NonNullable<Customer['status']>) => <Tag color={STATUS_COLOR[status]}>{status}</Tag>}
        />
        <Table.Column<Customer>
          dataIndex="registeredOn"
          title="Registered"
          render={(value: string) => <DateField value={value} format="YYYY-MM-DD" />}
        />
      </Table>
    </List>
  )
}
