import type { Metadata } from "next"
import { TeamDetailPage } from "@/components/team-detail-page"

interface Params {
  id: string
}

interface Props {
  params: Params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In a real app, you would fetch the team data from an API
  // For now, we'll just use a placeholder title
  return {
    title: `Team ${params.id} | Event Planning System`,
  }
}

export default function TeamPage({ params }: Props) {
  return <TeamDetailPage teamId={params.id} />
}

