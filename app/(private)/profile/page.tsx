"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"


export default function Home() {

    const router = useRouter()

    const handleLogout = async () => {
        await authClient.signOut()
        router.replace("/login")
    }

    return (
        <div className="flex min-h-svh p-6 animate-in fade-in duration-1000">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <h1 className="font-medium">Profile</h1>
                </div>
            </div>
        </div>
    )
}
