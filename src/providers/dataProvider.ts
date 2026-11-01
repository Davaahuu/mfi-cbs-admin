import type {
  BaseRecord,
  CreateResponse,
  DataProvider,
  GetListResponse,
  GetOneResponse,
  HttpError,
} from '@refinedev/core'
import { api, type Schemas } from '../api/client'
import { toHttpError } from '../api/errors'

export type Customer = Schemas['Individual'] | Schemas['Group']
export type RegisterIndividualRequest = Schemas['RegisterIndividualRequest']

function unsupported(what: string): never {
  throw { message: `${what} is not supported yet`, statusCode: 501 } satisfies HttpError
}

/**
 * Maps Refine's generic data calls onto the CBS endpoints, which are not a uniform REST shape:
 * each resource is wired here as its screens are added. Refine pages count from 1, the API from 0.
 */
export const dataProvider: DataProvider = {
  getApiUrl: () => '/api',

  async getList<TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
  }: Parameters<DataProvider['getList']>[0]): Promise<GetListResponse<TData>> {
    if (resource !== 'customers') unsupported(`Listing ${resource}`)
    const page = (pagination?.currentPage ?? 1) - 1
    const size = pagination?.pageSize ?? 20
    const { data, error, response } = await api.GET('/api/customers', { params: { query: { page, size } } })
    if (error || !data) throw toHttpError(response, error)
    return { data: (data.customers ?? []) as unknown as TData[], total: data.total ?? 0 }
  },

  async getOne<TData extends BaseRecord = BaseRecord>({
    resource,
    id,
  }: Parameters<DataProvider['getOne']>[0]): Promise<GetOneResponse<TData>> {
    if (resource !== 'customers') unsupported(`Reading ${resource}`)
    const { data, error, response } = await api.GET('/api/customers/{id}', {
      params: { path: { id: String(id) } },
    })
    if (error || !data) throw toHttpError(response, error)
    return { data: data as unknown as TData }
  },

  async create<TData extends BaseRecord = BaseRecord, TVariables = object>({
    resource,
    variables,
  }: Parameters<DataProvider['create']>[0] & { variables: TVariables }): Promise<CreateResponse<TData>> {
    if (resource !== 'customers') unsupported(`Creating ${resource}`)
    const { data, error, response } = await api.POST('/api/customers/individuals', {
      body: variables as unknown as RegisterIndividualRequest,
    })
    if (error || !data) throw toHttpError(response, error)
    return { data: data as unknown as TData }
  },

  update: async ({ resource }) => unsupported(`Updating ${resource}`),
  deleteOne: async ({ resource }) => unsupported(`Deleting ${resource}`),
}
