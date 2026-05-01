import axios from '@/axiosConfig'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '@/stores/alert'
import { useGraduateStore } from '@/stores/api/graduatesStore'
import type { User } from '@/interfaces/user'
import type { UsersResponse, UserResponse, CreateUserResponse, UpdateUserResponse } from '@/interfaces/api'

export const useUserStore = defineStore('userStore', () => {
  const router = useRouter()
  const { showAlert } = useAlertStore()

  const resUsers = ref<Map<number, User>>(new Map())
  const resUserDetails = ref<User | null>(null)

  const fetchUsers = async (): Promise<UsersResponse | undefined> => {
    try {
      const res = await axios.get<UsersResponse>('api/admin/users', {
        headers: { accept: 'application/json' },
      })
      resUsers.value = new Map(res.data.users.map((m) => [m.id, m]))
      return res.data
    } catch (error: any) {
      console.error('Error en usuarios:', error)
    }
  }

  const showUser = async (id: number): Promise<UserResponse | undefined> => {
    try {
      const res = await axios.get<UserResponse>(`api/admin/users/${id}`, {
        headers: { accept: 'application/json' },
      })
      resUserDetails.value = res.data.user
      return res.data
    } catch (error: any) {
      console.error('Error al obtener al usuario:', error)
    }
  }

  const createUser = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post<CreateUserResponse>('api/admin/users', form, {
        headers: { accept: 'application/json' },
      })

      if (param) {
        showAlert({
          title: 'Información guardada exitosamente.',
          status: 'success',
        })

        resUsers.value.set(param.data.createUser.id, param.data.createUser)
        return param.data.res
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join('\n')
          showAlert({ title: errorMessages, status: 'error' })
        } else {
          showAlert({
            title: errorData.message || 'Ocurrió un error inesperado.',
            status: 'error',
          })
        }
      } else {
        showAlert({ title: 'Error de red, intenta más tarde.', status: 'error' })
      }
      throw error
    }
  }

  const updateUser = async (form: unknown, id: number): Promise<unknown> => {
    try {
      const response = await axios.patch<UpdateUserResponse>(`api/admin/users/${id}`, form, {
        headers: { accept: 'application/json' },
      })

      const updatedUser = response?.data?.updateUser
      if (!updatedUser) {
        throw new Error('Respuesta inválida del servidor.')
      }

      showAlert({
        title: 'Información actualizada exitosamente.',
        status: 'success',
      })

      const { id: userId, user_type } = updatedUser
      const graduateStore = useGraduateStore()

      if (user_type === 'BEC_INACTIVE') {
        const newGradsMap = new Map(graduateStore.resGraduates)
        newGradsMap.set(userId, updatedUser)
        graduateStore.resGraduates = newGradsMap

        const newUsersMap = new Map(resUsers.value)
        newUsersMap.delete(userId)
        resUsers.value = newUsersMap
      } else {
        const newUsersMap = new Map(resUsers.value)
        newUsersMap.set(userId, updatedUser)
        resUsers.value = newUsersMap
      }

      if (resUserDetails.value?.id === id) {
        resUserDetails.value = updatedUser
      }

      return response.data.res
    } catch (error: any) {
      console.error('Error en updateUser:', error)
      const errorMessage = error.response?.data?.message || 'Error de red, intenta más tarde.'
      showAlert({ title: errorMessage, status: 'error' })
      throw error
    }
  }

  return {
    resUsers,
    resUserDetails,
    showUser,
    createUser,
    fetchUsers,
    updateUser,
  }
})
