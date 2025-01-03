"use client"
import { Button } from "@/components/ui/button"
import { Pencil } from 'lucide-react'

interface EditButtonProps {
  onClick: () => void
}

export function EditButton({ onClick }: EditButtonProps) {
  return (
    <Button variant="outline" size="icon" onClick={onClick}>
      <Pencil className="h-4 w-4" />
      <span className="sr-only">Edit</span>
    </Button>
  )
}

