import type { Metadata } from "next"
import { getTeam } from "./mock-data"
import { TeamDetailPage } from "./team-detail-page"

interface Params {
  id: string
}

interface Props {
  params: Params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const team = await getTeam(params.id)

  if (!team) {
    return {
      title: "Team Not Found",
    }
  }

  return {
    title: team.name,
  }
}

export default async function TeamPage({ params }: Props) {
  const team = await getTeam(params.id)

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
        <p className="text-gray-500 mb-4">The team you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    )
  }

  return <TeamDetailPage initialTeam={team} />
}

