export interface Generation {
  id: number
  campus: string
  generation_active: boolean
  generation_name: string
  // Becarios with pending payments (retícula or grace months). Missing => 0.
  pending_becarios_count?: number
}

export interface GenerationForm {
  generation_name: string
  campus: string
  generation_active: boolean
}
