import { createFileRoute } from '@tanstack/react-router'

import { OnboardingPage } from './onboarding'

export const Route = createFileRoute('/card')({ component: OnboardingPage })
