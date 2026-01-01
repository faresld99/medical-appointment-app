import Link from "next/link"
import { getPractitioners } from "@/lib/queries/practitioners"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Calendar } from "lucide-react"

type DoctorListProps = {
  filters: { specialty?: string; location?: string }
}

export async function DoctorList({ filters }: DoctorListProps) {
  const practitioners = await getPractitioners(filters)

  if (practitioners.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">No doctors found</h3>
        <p className="mt-2 text-muted-foreground">Try adjusting your search filters or check back later.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {practitioners.map((practitioner) => {
        const initials = practitioner.user_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <Card key={practitioner.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{practitioner.user_name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {practitioner.specialty}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{practitioner.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{practitioner.appointment_duration} min appointments</span>
                </div>
              </div>

              {practitioner.bio && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{practitioner.bio}</p>
              )}

              <Button asChild className="mt-4 w-full">
                <Link href={`/doctors/${practitioner.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Profile & Book
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
