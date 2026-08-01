import type { User } from './user'
import type { Graduate } from './graduate'
import type { Business, BusinessData, BusinessAgreement } from './business'
import type { VacantPosition } from './vacant'
import type { JobApplication } from './jobApplication'
import type { Area, CandidateData } from './data'
import type { ClassEntity, ClassAttendance } from './class'
import type { Generation } from './generation'
import type { Notice } from './notice'
import type { Role, Permission } from './role'

// Users
export interface UsersResponse { users: User[] }
export interface UserResponse { user: User }
export interface CreateUserResponse { createUser: User; res: unknown }
export interface CreatePersonResponse { createPerson: User; res: unknown }
export interface UpdateUserResponse { updateUser: User; res: unknown }

// Auth
export interface LoginResponse { token: string }
export interface PermissionsListResponse { permissions: string[] }
export interface UpdateProfileResponse { user: User; res: unknown }

// Graduates
export interface GraduatesResponse { graduates: Graduate[] }
export interface GraduateResponse { user: Graduate }
export interface CreateGraduateResponse { createGraduate: Graduate; res: unknown }
export interface UpdateGraduateResponse { updateGraduate: Graduate; res: unknown }

// Business
export interface BusinessListResponse { business: Business[] }
export interface GetBusinessResponse { business: Business }
export interface GetBusinessDataResponse { data: BusinessData }
export interface GetBusinessAgreementsResponse { agreements: BusinessAgreement[] }
export interface CreateBusinessResponse { createBusiness: Business; res: unknown }
export interface UpdateBusinessResponse { updateBusiness: Business; res: unknown }
export interface UpdateBusinessDataResponse { updateData: BusinessData; res: unknown }
export interface CreateAgreementResponse { agreement: BusinessAgreement; res: unknown }

// Vacant positions
export interface VacantPositionsResponse { positions: VacantPosition[] }
export interface ShowVacantResponse { vacant: VacantPosition }
export interface UpdateVacantResponse { updateVacant: VacantPosition; res: unknown }
export interface UpdatePracticeResponse { updatePractice: VacantPosition; res: unknown }
export interface UpdateVacantJrResponse { updateVacantJr: VacantPosition; res: unknown }
export interface StatusVacantResponse { vacant: VacantPosition; res: unknown }
export interface CreateVacantResponse { createVacant: VacantPosition; res: unknown }
export interface CreateVacantJrResponse { createVacantJr: VacantPosition; res: unknown }
export interface CreatePracticeResponse { createPractice: VacantPosition; res: unknown }

// Job applications
export interface ApplicationsResponse { applications: JobApplication[] }
export interface UpdateApplicationResponse { application: JobApplication }

// Areas & candidate data
export interface AreasResponse { areas: Area[] }
export interface CandidatesResponse { candidates: CandidateData[] }
export interface CreateAreaResponse { createArea: Area; res: unknown }
export interface UpdateAreaResponse { updateArea: Area; res: unknown }
export interface CreateCandidateDataResponse { createData: CandidateData; res: unknown }
export interface UpdateCandidateDataResponse { updateData: CandidateData; res: unknown }

// Classes
export interface ClassListResponse { data: ClassEntity[] }
export interface ClassDetailResponse { data: ClassEntity }
export interface ClassAttendancesResponse { data: ClassAttendance[] }
export interface FilterUsersResponse { data: User[] }
export interface ClassOperationResponse { data: ClassEntity }
export interface AttendancesOperationResponse { data: ClassAttendance[] }
export interface AttendanceOperationResponse { data: ClassAttendance }

// Generations
export interface GenerationsResponse { generations: Generation[] }
export interface CreateGenerationResponse { createGeneration: Generation; res: unknown }
export interface UpdateGenerationResponse { data: Generation }

// Notices
export interface NoticesResponse { data: Notice[] }
export interface NoticeOperationResponse { data: Notice }

// Roles & permissions
export interface RolesResponse { roles: Role[] }
export interface PermissionsResponse { permissions: Permission[] }
export interface UpdateRoleResponse { data: Role }

// Scholarships
import type {
  ScholarshipProfile,
  ScholarshipRefrend,
  StudentDocument,
  AttendanceSummary,
  ScholarshipSemesterGrade,
  ScholarshipWithholding,
} from './scholarship'

export interface ScholarshipProfileResponse { data: ScholarshipProfile }
export interface ScholarshipRefrendsResponse { data: ScholarshipRefrend[] }
export interface ScholarshipRefrendResponse { data: ScholarshipRefrend }
export interface ScholarshipWithholdingsResponse { data: ScholarshipWithholding[] }
export interface ScholarshipDocumentsResponse { data: StudentDocument[] }
export interface ScholarshipDocumentResponse { data: StudentDocument }
export interface GenerateRefrendsResponse { data: { created: number; skipped: number; errors: number } }
export interface AttendanceSummaryResponse { res: boolean; data: AttendanceSummary }
export interface SemesterGradesResponse { res: boolean; data: ScholarshipSemesterGrade[] }
export interface SemesterGradeResponse { res: boolean; data: ScholarshipSemesterGrade }
export interface GraduatePersonResponse { res: boolean; msg: string; data: User }
