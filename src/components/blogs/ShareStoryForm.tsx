import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import {
  knowledgeCenterApi,
  type KnowledgeCenterSubmissionType,
} from '../../api/knowledgeCenterApi'
import styles from '../../pages/LivingHistoryHubPage.module.css'

type ContributionFormState = {
  name: string
  email: string
  phone: string
  type: KnowledgeCenterSubmissionType
  message: string
}

const initialContributionForm: ContributionFormState = {
  name: '',
  email: '',
  phone: '',
  type: 'post',
  message: '',
}

export function ShareStoryForm() {
  const [contributeForm, setContributeForm] =
    useState<ContributionFormState>(initialContributionForm)
  const [isSubmittingContribution, setIsSubmittingContribution] = useState(false)

  async function handleContributionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmittingContribution) {
      return
    }

    try {
      setIsSubmittingContribution(true)
      const submittedType = contributionTypeNotificationLabel(contributeForm.type)

      await knowledgeCenterApi.submitContribution(contributeForm)
      setContributeForm(initialContributionForm)
      toast.success(
        `Your Living History submission for ${submittedType} has been received. Our team will be reaching out to you shortly for further details.`,
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to submit your story right now.',
      )
    } finally {
      setIsSubmittingContribution(false)
    }
  }

  return (
    <section className={styles.contribute}>
      <div className={styles.contributeInner}>
        <p className={styles.tvEyebrow}>Share Your Story</p>
        <h2 className={styles.contributeTitle}>Add to the Living History</h2>
        <div className={styles.featureRule} aria-hidden="true" />
        <p className={styles.contributeLead}>
          Have a story, a memory, or a video you'd like to share? Tell us a
          little about it and our team will reach out to help you add it to
          the Living History Hub.
        </p>

        <form
          className={styles.contributeForm}
          onSubmit={(event) => {
            void handleContributionSubmit(event)
          }}
        >
          <div className={styles.formRow}>
            <label className={styles.formField}>
              <span>Name</span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                value={contributeForm.name}
                onChange={(event) =>
                  setContributeForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.formField}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={contributeForm.email}
                onChange={(event) =>
                  setContributeForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formField}>
              <span>Phone (optional)</span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={contributeForm.phone}
                onChange={(event) =>
                  setContributeForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.formField}>
              <span>I'd like to submit</span>
              <select
                name="type"
                value={contributeForm.type}
                onChange={(event) =>
                  setContributeForm((current) => ({
                    ...current,
                    type: event.target.value as KnowledgeCenterSubmissionType,
                  }))
                }
              >
                <option value="post">A written post / story</option>
                <option value="video">A video</option>
                <option value="both">Both a post and a video</option>
              </select>
            </label>
          </div>

          <label className={styles.formField}>
            <span>Tell us about it</span>
            <textarea
              name="message"
              rows={5}
              required
              value={contributeForm.message}
              onChange={(event) =>
                setContributeForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
            />
          </label>

          <button
            type="submit"
            className={styles.revealButton}
            disabled={isSubmittingContribution}
          >
            {isSubmittingContribution ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </section>
  )
}

function contributionTypeNotificationLabel(value: KnowledgeCenterSubmissionType) {
  switch (value) {
    case 'post':
      return 'a story'
    case 'video':
      return 'a video'
    case 'both':
      return 'a story and a video'
    default:
      return 'your contribution'
  }
}
