import { Button } from "@/components/ui/button"
import { Eye } from 'lucide-react'

interface ViewButtonProps {
  onClick: () => void
}

export function ViewButton({ onClick }: ViewButtonProps) {
  return (
    <Button variant="outline" size="icon" onClick={onClick}>
      <Eye className="h-4 w-4" />
      <span className="sr-only">View</span>
    </Button>
  )
}

