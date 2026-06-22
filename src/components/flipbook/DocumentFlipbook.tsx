import { NewsletterFlipbook } from '../newsletters/NewsletterFlipbook'
import type { NewsletterFlipbookSource } from '../../lib/newsletterMedia'

export type DocumentFlipbookSource = NewsletterFlipbookSource

type DocumentFlipbookProps = {
  source: DocumentFlipbookSource
  title: string
  theme?: 'default' | 'cookbook'
}

export function DocumentFlipbook({ source, title, theme }: DocumentFlipbookProps) {
  return <NewsletterFlipbook source={source} title={title} theme={theme} />
}
