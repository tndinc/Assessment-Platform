"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { fetchUpcomingExams } from "@/lib/supabase"

export function CalendarView() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      try {
        const upcomingExams = await fetchUpcomingExams()
        
        setEvents(upcomingExams)
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadEvents()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Events</h1>
          <p className="text-muted-foreground">Schedule of upcoming assessments, assignments, and important dates</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Events</h1>
        <p className="text-muted-foreground">Schedule of upcoming assessments, assignments, and important dates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {/* <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View and manage upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              className="rounded-md border"
              modifiers={{
                event: events.map((event) => event.date),
              }}
              modifiersStyles={{
                event: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                  borderRadius: "0",
                },
              }}
            />
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Assessments and important dates</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">{event.date.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={ 
                        event.type === "exam"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : event.type === "quiz"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            : event.type === "homework"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : event.type === "project"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                      }
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
