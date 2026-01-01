import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Mail } from "lucide-react"
import type { PractitionerWithUser } from "@/lib/db"

type DoctorProfileProps = {
  practitioner: PractitionerWithUser
}

export function DoctorProfile({ practitioner }: DoctorProfileProps) {
  const initials = practitioner.user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardHeader className="text-center">
        <Avatar className="mx-auto h-24 w-24">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold text-foreground">{practitioner.user_name}</h1>
        <Badge variant="secondary" className="mx-auto mt-2">
          {practitioner.specialty}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
          <span>{practitioner.location}</span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock className="h-5 w-5 flex-shrink-0 text-primary" />
          <span>{practitioner.appointment_duration} minute appointments</span>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="truncate">{practitioner.user_email}</span>
        </div>

        {practitioner.bio && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground">About</h3>
            <p className="mt-2 text-sm text-muted-foreground">{practitioner.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
