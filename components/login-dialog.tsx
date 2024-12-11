"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChromeIcon as Google } from 'lucide-react'

export function LoginDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Log In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log in to your account</DialogTitle>
          <DialogDescription>
            Choose your preferred login method below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <Button variant="outline" className="w-full" onClick={() => console.log("Login with Google clicked")}>
            <Google className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

