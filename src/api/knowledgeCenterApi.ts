import { API_ROUTES } from '../constants/api'
import { apiClient } from './apiClient'

export type KnowledgeCenterSubmissionType = 'post' | 'video' | 'both'

export type KnowledgeCenterSubmissionInput = {
  name: string
  email: string
  phone?: string
  type: KnowledgeCenterSubmissionType
  message: string
}

type KnowledgeCenterApiSubmission = {
  id: number
  submitter_name: string
  submitter_email: string
  submitter_phone: string
  submission_type: KnowledgeCenterSubmissionType
  message: string
  status: 'open' | 'completed'
  completion_notes: string
  completed_at?: string
  created_at: string
  updated_at: string
}

type KnowledgeCenterCreateResponse = {
  message: string
  submission: KnowledgeCenterApiSubmission
}

export const knowledgeCenterApi = {
  async submitContribution(input: KnowledgeCenterSubmissionInput) {
    const response = await apiClient.post<KnowledgeCenterCreateResponse>(
      API_ROUTES.knowledgeCenterSubmissions,
      {
        name: input.name,
        email: input.email,
        phone: input.phone ?? '',
        type: input.type,
        message: input.message,
      },
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return response.data
  },
}
