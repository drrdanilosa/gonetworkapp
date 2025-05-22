'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, PlusCircle } from "lucide-react"

interface TaskCardProps {
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  tags: string[]
  dueDate?: string
  assignedTo?: {
    name: string
    avatar?: string
  }
  isMobile?: boolean
}

export function TaskCard({
  title,
  description,
  status,
  tags,
  dueDate,
  assignedTo,
  isMobile = false
}: TaskCardProps) {  return (
    <Card className="overflow-hidden transition-all hover:shadow-dracula-md">
      <CardHeader className={`${isMobile ? 'p-3' : 'pb-3'} relative`}>
        {status === "pending" && (
          <div className="absolute right-3 md:right-4 top-3 md:top-4">
            <Badge variant="outline" className="text-dracula-orange border-dracula-orange text-xs">
              <Clock className="mr-1 h-3 w-3" /> {isMobile ? "P" : "Pendente"}
            </Badge>
          </div>
        )}
        
        {status === "in-progress" && (
          <div className="absolute right-3 md:right-4 top-3 md:top-4">
            <Badge className="bg-dracula-purple text-white text-xs">
              {isMobile ? "Em prog." : "Em Progresso"}
            </Badge>
          </div>
        )}
        
        {status === "completed" && (
          <div className="absolute right-3 md:right-4 top-3 md:top-4">
            <Badge className="bg-dracula-green text-white text-xs">
              <Check className="mr-1 h-3 w-3" /> {isMobile ? "Ok" : "Concluído"}
            </Badge>
          </div>
        )}
        
        <CardTitle className={`font-medium ${isMobile ? 'text-base' : ''}`}>{title}</CardTitle>
        <CardDescription className={`line-clamp-2 text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
          {description}
        </CardDescription>
      </CardHeader>      <CardContent className={`${isMobile ? 'p-3 pb-2' : 'pb-3'}`}>
        <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className={`${isMobile ? 'text-[10px] px-1.5 h-5' : 'text-xs'}`}>
              {tag}
            </Badge>
          ))}
        </div>
        {dueDate && (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            <span className="font-medium">{isMobile ? 'Entrega:' : 'Data de entrega:'}</span> {dueDate}
          </div>
        )}
      </CardContent>
      <CardFooter className={`${isMobile ? 'p-3 pt-2' : 'pt-3'} flex items-center justify-between border-t border-border`}>
        {assignedTo ? (
          <div className="flex items-center gap-2">
            <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-dracula-purple/20 flex items-center justify-center`}>
              {assignedTo.avatar ? (
                <img 
                  src={assignedTo.avatar} 
                  alt={assignedTo.name}
                  className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rounded-full object-cover`}
                />
              ) : (
                <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium text-primary`}>
                  {assignedTo.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} truncate max-w-[100px] md:max-w-full`}>{assignedTo.name}</span>
          </div>
        ) : (
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Não atribuído</div>
        )}
        <Button size={isMobile ? "sm" : "default"} variant="ghost" className={isMobile ? "px-2" : ""}>
          <PlusCircle className="h-4 w-4 mr-1" /> {isMobile ? "" : "Detalhes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
