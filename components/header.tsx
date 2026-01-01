import Link from "next/link"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Stethoscope, Menu } from "lucide-react"

export async function Header() {
    const session = await getSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Stethoscope className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">MedBook</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <Link
                        href="/doctors"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Find Doctors
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    {session ? (
                        <>
                            <NotificationBell />
                            <UserMenu user={session.user} />
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild className="hidden sm:flex">
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild className="hidden sm:flex">
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </>
                    )}

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col gap-4">
                                <Link
                                    href="/doctors"
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Find Doctors
                                </Link>
                                <Link
                                    href="/about"
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    About
                                </Link>
                                {session ? (
                                    <>
                                        <Link
                                            href={session.user.role === "practitioner" ? "/dashboard/practitioner" : "/dashboard/patient"}
                                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
