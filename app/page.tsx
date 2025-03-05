import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, DollarSign, Users } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Budget Overview</h2>
            <DollarSign className="text-blue-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">$15,000</p>
          <p className="text-sm text-gray-500">Total Budget</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Guest List</h2>
            <Users className="text-green-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">150</p>
          <p className="text-sm text-gray-500">Confirmed Guests</p>
        </Card>
        <Link href="/tasks" passHref>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <BarChart className="text-yellow-500" size={24} />
            </div>
            <p className="mt-2 text-3xl font-bold">75%</p>
            <p className="text-sm text-gray-500">Tasks Completed</p>
          </Card>
        </Link>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Event Date</h2>
            <Calendar className="text-purple-500" size={24} />
          </div>
          <p className="mt-2 text-3xl font-bold">30</p>
          <p className="text-sm text-gray-500">Days Remaining</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Venue booked</span>
              <span className="text-sm text-gray-500">2 days ago</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Catering menu finalized</span>
              <span className="text-sm text-gray-500">4 days ago</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Invitations sent</span>
              <span className="text-sm text-gray-500">1 week ago</span>
            </li>
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Finalize decorations</span>
              <Button size="sm">Complete</Button>
            </li>
            <li className="flex items-center justify-between">
              <span>Confirm entertainment</span>
              <Button size="sm">Complete</Button>
            </li>
            <li className="flex items-center justify-between">
              <span>Review seating arrangements</span>
              <Button size="sm">Complete</Button>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

