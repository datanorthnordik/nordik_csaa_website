import { NewsletterFlipbook } from '../newsletters/NewsletterFlipbook'
import type { NewsletterFlipbookSource } from '../../lib/newsletterMedia'

export type DocumentFlipbookSource = NewsletterFlipbookSource

type DocumentFlipbookProps = {
  source: DocumentFlipbookSource
  title: string
}

export function DocumentFlipbook({ source, title }: DocumentFlipbookProps) {
  return <NewsletterFlipbook source={source} title={title} />
}
