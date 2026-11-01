import { Create, useForm } from '@refinedev/antd'
import type { HttpError } from '@refinedev/core'
import { Col, DatePicker, Form, Input, Row, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import type { Customer, RegisterIndividualRequest } from '../../providers/dataProvider'

type DocumentType = RegisterIndividualRequest['document']['type']

/** The form's fields; flattened from the request so every input is a plain field. */
interface IndividualForm {
  givenName: string
  familyName: string
  dateOfBirth: Dayjs
  documentType: DocumentType
  documentNumber: string
  issuingCountry: string
  expiresOn?: Dayjs
  phone: string
  address: string
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport' },
]

const ISO_DATE = 'YYYY-MM-DD'

function toRequest(form: IndividualForm): RegisterIndividualRequest {
  return {
    givenName: form.givenName.trim(),
    familyName: form.familyName.trim(),
    dateOfBirth: form.dateOfBirth.format(ISO_DATE),
    document: {
      type: form.documentType,
      number: form.documentNumber.trim(),
      issuingCountry: form.issuingCountry.trim().toUpperCase(),
      expiresOn: form.expiresOn?.format(ISO_DATE),
    },
    phone: form.phone.trim(),
    address: form.address.trim(),
  }
}

const required = (message: string) => [{ required: true, whitespace: true, message }]

/**
 * Registers an individual. The backend also checks the minimum age, that the document has not
 * expired, and that it is not registered already; its message is shown if it refuses.
 */
export function CustomerCreate() {
  const { formProps, saveButtonProps, onFinish } = useForm<Customer, HttpError, IndividualForm>({
    resource: 'customers',
    action: 'create',
    redirect: 'list',
    successNotification: () => ({ message: 'Customer registered', type: 'success' }),
  })

  return (
    <Create title="Register individual" saveButtonProps={saveButtonProps}>
      <Form<IndividualForm>
        {...formProps}
        layout="vertical"
        initialValues={{ documentType: 'NATIONAL_ID', issuingCountry: 'MN' }}
        // Refine types the request like the form; what is sent is the API's shape built from it. A
        // refusal is already shown as a notification, so the rejected promise is handled here.
        onFinish={(values) => onFinish(toRequest(values) as unknown as IndividualForm).catch(() => undefined)}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="givenName" label="Given name" rules={required('Enter the given name')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="familyName" label="Family name" rules={required('Enter the family name')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="dateOfBirth" label="Date of birth" rules={[{ required: true, message: 'Enter the date of birth' }]}>
              <DatePicker style={{ width: '100%' }} format={ISO_DATE} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="phone" label="Phone" rules={required('Enter the phone number')} extra="International format, e.g. +97699112233">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="documentType" label="Identity document" rules={[{ required: true }]}>
              <Select options={DOCUMENT_TYPES} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="documentNumber" label="Document number" rules={required('Enter the document number')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item
              name="issuingCountry"
              label="Issued by"
              rules={[{ required: true, pattern: /^[A-Za-z]{2}$/, message: 'Two-letter country code' }]}
            >
              <Input maxLength={2} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="expiresOn" label="Expires">
              <DatePicker style={{ width: '100%' }} format={ISO_DATE} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="address" label="Address" rules={required('Enter the address')}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  )
}
