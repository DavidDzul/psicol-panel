export interface Notice {
  id: number
  message: string
  campus: string
  active: boolean
  global: boolean
}

export interface NoticeForm {
  message: string
  campus: string
  active: boolean
  global: boolean
}
