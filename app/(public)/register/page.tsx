"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function Register() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!email || !name || !password || !confirmPassword) {
      toast.error("Please fill in all fields.")
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    toast.promise(
      (async () => {
        const result = await authClient.signUp.email({
          email: email,
          password: password,
          name: name,
          callbackURL: `/`,
        })

        if (!result.data || result.error) {
          throw result.error || new Error("Registration failed")
        }

        router.replace("/")
        return result
      })(),
      {
        loading: "Registering...",
        success: "Registration successful!",
        error: (error) =>
          `Registration failed: ${error.message || "Unknown error"}`,
      }
    )

    // console.log(`Registering with email: ${email} and password: ${password}`)

    // toast.success("Registration successful!")
  }

  return (
    <div className="register to-gradient flex min-h-svh items-center justify-center bg-linear-to-br from-accent">
      <Card className="w-full max-w-sm p-5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="mt-1 grid gap-4">
            <Field className="max-w-sm">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </InputGroup>
            </Field>

            <Field className="max-w-sm">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </Field>

            <Field className="max-w-sm">
              <FieldLabel htmlFor="inline-end-input">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="inline-end-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    className="h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field className="max-w-sm">
              <FieldLabel htmlFor="inline-end-input">Confirm your password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="inline-end-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    className="h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Button className="cursor-pointer" onClick={handleSubmit}>
              Register
            </Button>
            <CardDescription className="text-center text-[10px]">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary hover:text-primary-foreground motion-safe:transition"
              >
                Login here
              </a>
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
