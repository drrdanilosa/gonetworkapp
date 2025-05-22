import { z } from 'zod'

// Validação de projetos
export const ProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.date().optional(),
  teamMembers: z.array(z.string()).optional(),
})

// Validação de vídeos
export const VideoSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  duration: z.number().positive().optional(),
  resolution: z.string().optional(),
  format: z.string().optional(),
  size: z.number().positive().optional(),
})

// Validação de comentários
export const CommentSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  timestamp: z.number().min(0, 'Timestamp deve ser positivo'),
  type: z.enum(['general', 'technical', 'creative', 'approval']),
  position: z
    .object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
})

// Validação de usuários
export const UserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'editor', 'viewer']),
  avatar: z.string().url().optional(),
})

export type Project = z.infer<typeof ProjectSchema>
export type Video = z.infer<typeof VideoSchema>
export type Comment = z.infer<typeof CommentSchema>
export type User = z.infer<typeof UserSchema>
