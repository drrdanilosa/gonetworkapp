// app/api/exports/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId
  const exportsDir = path.join(process.cwd(), 'public', 'exports', projectId)
  let files: string[] = []

  try {
    files = fs.readdirSync(exportsDir)
  } catch (error) {
    // Diretório não existe ou não pode ser lido
    return NextResponse.json({ videos: [] })
  }

  // Filtrar apenas arquivos .mp4
  const videos = files
    .filter(name => name.toLowerCase().endsWith('.mp4'))
    .map(name => {
      const filePath = path.join(exportsDir, name)
      const stat = fs.statSync(filePath)
      return {
        name,
        url: `/exports/${projectId}/${name}`,
        uploadedAt: stat.mtime.toISOString(),
      }
    })

  return NextResponse.json({ videos })
}
