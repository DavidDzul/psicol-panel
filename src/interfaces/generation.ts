export interface Generation {
  id: number
  campus: string
  generation_active: boolean
  generation_name: string
}

export interface GenerationForm {
  generation_name: string
  campus: string
  generation_active: boolean
}
