import type { HttpError } from '@refinedev/core'

/** The problem+json body every CBS error response carries. */
interface Problem {
  title?: string
  detail?: string
  status?: number
  /** Field errors from request validation, as "field: message". */
  errors?: string[]
  /** Business rules broken, e.g. loan terms or password policy. */
  violations?: string[]
}

/** Turns a CBS error response into the error shape Refine shows in its notifications. */
export function toHttpError(response: Response, body: unknown): HttpError {
  const problem = (body ?? {}) as Problem
  const details = problem.errors ?? problem.violations ?? []
  const message = [problem.detail ?? problem.title ?? response.statusText, ...details].filter(Boolean).join('\n')
  return { message: message || `Request failed (${response.status})`, statusCode: response.status }
}
