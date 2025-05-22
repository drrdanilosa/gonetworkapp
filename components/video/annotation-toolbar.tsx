"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Circle, Edit2, Eraser, Highlighter, Pencil, Square, Type, ArrowUpRight } from "lucide-react"
import type { AnnotationTool } from "./annotation-canvas"

interface AnnotationToolbarProps {
  isAnnotationMode: boolean
  setIsAnnotationMode: (value: boolean) => void
  selectedTool: AnnotationTool
  setSelectedTool: (tool: AnnotationTool) => void
  selectedColor: string
  setSelectedColor: (color: string) => void
  selectedThickness: number
  setSelectedThickness: (thickness: number) => void
}

const COLORS = [
  "#ff0000", // Vermelho
  "#ff8000", // Laranja
  "#ffff00", // Amarelo
  "#00ff00", // Verde
  "#00ffff", // Ciano
  "#0000ff", // Azul
  "#8000ff", // Roxo
  "#ff00ff", // Magenta
  "#ffffff", // Branco
  "#000000", // Preto
]

export default function AnnotationToolbar({
  isAnnotationMode,
  setIsAnnotationMode,
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
  selectedThickness,
  setSelectedThickness,
}: AnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-background/90 border rounded-md shadow-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle pressed={isAnnotationMode} onPressedChange={setIsAnnotationMode} size="sm" className="h-8 w-8 p-0">
              <Edit2 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Modo de Anotação</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isAnnotationMode && (
        <>
          <div className="h-6 w-px bg-border mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "pen"}
                  onPressedChange={() => setSelectedTool("pen")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Caneta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "highlighter"}
                  onPressedChange={() => setSelectedTool("highlighter")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Highlighter className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Marcador</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "arrow"}
                  onPressedChange={() => setSelectedTool("arrow")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Seta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "rectangle"}
                  onPressedChange={() => setSelectedTool("rectangle")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Square className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Retângulo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "ellipse"}
                  onPressedChange={() => setSelectedTool("ellipse")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Circle className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Elipse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "text"}
                  onPressedChange={() => setSelectedTool("text")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Type className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Texto</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={selectedTool === "eraser"}
                  onPressedChange={() => setSelectedTool("eraser")}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Eraser className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Borracha</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-6 w-px bg-border mx-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" style={{ backgroundColor: selectedColor }} />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="center">
              <div className="grid grid-cols-5 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className="h-6 w-6 rounded-full border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                {selectedThickness}px
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="center">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Espessura</p>
                <Slider
                  value={[selectedThickness]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setSelectedThickness(value[0])}
                  className="w-32"
                />
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  )
}
