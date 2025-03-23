export const API_URL = "http://127.0.0.1:8000/";
// export const API_URL = "https://api.develop.iu.org.mx/";
export const FILE_URL = import.meta.env.VITE_FILES_URL

export const campusArray = [
    { value: 'MERIDA', text: "Mérida" },
    { value: 'VALLADOLID', text: "Valladolid" },
    { value: 'TIZIMIN', text: "Tizimín" },
    { value: 'OXKUTZCAB', text: "Oxkutzcab" },
]

export const campusMap = new Map([
    [
        'MERIDA',
        {
            value: 'MERIDA',
            text: "Mérida",
        },
    ],
    [
        'VALLADOLID',
        {
            value: 'VALLADOLID',
            text: "Valladolid",
        },
    ],
    [
        'TIZIMIN',
        {
            value: 'TIZIMIN',
            text: "Tizimín",
        },
    ],
    [
        'OXKUTZCAB',
        {
            value: 'OXKUTZCAB',
            text: "Oxkutzcab",
        },
    ],
])

export const roleArray = [
    { value: "BASIC", text: "Básico" },
    { value: "BRONZE", text: "Bronce" },
    { value: "SILVER", text: "Plata" },
    { value: "GOLD", text: "Oro" },
    { value: "PLATINUM", text: "Platino" },
    { value: "DIAMOND", text: "Diamante" },
]

export const roleMap = new Map([
    [
        'BASIC',
        {
            value: 'BASIC',
            text: "Básico",
        },
    ],
    [
        'BRONZE',
        {
            value: 'BRONZE',
            text: "Bronce",
        },
    ],
    [
        'SILVER',
        {
            value: 'SILVER',
            text: "Plata",
        },
    ],
    [
        'GOLD',
        {
            value: 'GOLD',
            text: "Oro",
        },
    ],
    [
        'PLATINUM',
        {
            value: 'PLATINUM',
            text: "Platino",
        },
    ],
    [
        'DIAMOND',
        {
            value: 'DIAMOND',
            text: "Diamante",
        },
    ],
])

export const lineBusiness = [
    { value: "EDUCATIONAL", text: "Educativo" },
    { value: "GOVERNMENT", text: "Gobierno" },
    { value: "HEALTH", text: "Salud" },
    { value: "ENVIRONMENT", text: "Medio ambiente" },
    { value: "TOURISM", text: "Turismo" },
    { value: "FOOD_AND_DRINKS", text: "Alimentos y bebidas" },
    { value: "COMMUNICATION", text: "Comunicación" },
    { value: "CONSTRUCTION_AND_DESIGN", text: "Construcción y diseño" },
    { value: "ADMINISTRATION", text: "Administración" },
    { value: "MANUFACTURE", text: "Manufactura" },
    { value: "OTHER", text: "Otro" },
]

export const becTypeArray = [
    { value: "BEC_ACTIVE", text: "Becario" },
    { value: "BEC_INACTIVE", text: "Egresado" },
]

export const becTypeMap = new Map([
    [
        'BEC_ACTIVE',
        {
            value: 'BEC_ACTIVE',
            text: "Becario",
        },
    ],
    [
        'BEC_INACTIVE',
        {
            value: 'BEC_INACTIVE',
            text: "Egresado",
        },
    ],
])

export const rolesMap = new Map([
    [
        'BASIC',
        {
            value: 'BASIC',
            text: "Básico",
        },
    ],
    [
        'BRONZE',
        {
            value: 'BRONZE',
            text: "Bronce",
        },
    ],
    [
        'SILVER',
        {
            value: 'SILVER',
            text: "Plata",
        },
    ],
    [
        'GOLD',
        {
            value: 'GOLD',
            text: "Oro",
        },
    ],
    [
        'PLATINUM',
        {
            value: 'PLATINUM',
            text: "Platino",
        },
    ],
    [
        'DIAMOND',
        {
            value: 'DIAMOND',
            text: "Diamante",
        },
    ],
])

export const permissionsMap = new Map([
    [
        'CANDIDATES_VIEW',
        {
            value: 'CANDIDATES_VIEW',
            text: "Visualizar apartado de candidatos",
        },
    ],
    [
        'CREATE_VACANT_JR',
        {
            value: 'CREATE_VACANT_JR',
            text: "Creación de vacantes JR",
        },
    ],
])

export const vacantTypeMap = new Map([
    [
        'JOB_POSITION',
        {
            value: 'JOB_POSITION',
            text: "Laboral",
        },
    ],
    [
        'PROFESSIONAL_PRACTICE',
        {
            value: 'PROFESSIONAL_PRACTICE',
            text: "Prácticas profesionales",
        },
    ],
    [
        'JR_POSITION',
        {
            value: 'JR_POSITION',
            text: "Vacante Jr",
        },
    ],
])

export const modeArray = [
    { value: "IN_PERSON", text: "Presencial" },
    { value: "REMOTE", text: "Remoto" },
    { value: "HYBRID", text: "Híbrido" },
]

export const modeVacantMap = new Map([
    [
        'IN_PERSON',
        {
            value: 'IN_PERSON',
            text: "Presencial",
        },
    ],
    [
        'REMOTE',
        {
            value: 'REMOTE',
            text: "Remoto",
        },
    ],
    [
        'HYBRID',
        {
            value: 'HYBRID',
            text: "Híbrido",
        },
    ],
])

export const rejectedReasonMap = new Map([
    [
        'US_FIND_JOB',
        {
            value: 'US_FIND_JOB',
            text: "Ya encontré un trabajo",
        },
    ],
    [
        'US_NOT_EXPECTATIONS',
        {
            value: 'US_NOT_EXPECTATIONS',
            text: "No cumple mis expectativas laborales/servicio",
        },
    ],
    [
        'US_PERSONAL_PROBLEMS',
        {
            value: 'US_PERSONAL_PROBLEMS',
            text: "Me surgieron imprevistos personales (académicos, laborales, salud, etc).",
        },
    ],
    [
        'US_CONFUSION',
        {
            value: 'US_CONFUSION',
            text: "Me confundí al postularme",
        },
    ],
    [
        'BS_UNSOLICITED',
        {
            value: 'BS_UNSOLICITED',
            text: "No cumple el perfil solicitado",
        },
    ],
    [
        'BS_WAS_COVERED',
        {
            value: 'BS_WAS_COVERED',
            text: "Ya se cubrió la vacante",
        },
    ],
    [
        'BS_NOT_REQUIRED',
        {
            value: 'BS_NOT_REQUIRED',
            text: "Ya no requiero cubrir la vacante",
        },
    ],
    [
        'BS_USER_NOT_CONTINUE',
        {
            value: 'BS_USER_NOT_CONTINUE',
            text: "El postulante decide no continuar con el proceso",
        },
    ],
    [
        'OTHER',
        {
            value: 'OTHER',
            text: "Otro",
        },
    ],

])

export const statusApplicationMap = new Map([
    [
        'PENDING',
        {
            value: 'PENDING',
            text: "Pendiente",
        },
    ],
    [
        'ACCEPTED',
        {
            value: 'ACCEPTED',
            text: "Aceptado",
        },
    ],
    [
        'REJECTED',
        {
            value: 'REJECTED',
            text: "Descartado",
        },
    ],
])

export const bsRejectedArray = [
    { value: "BS_UNSOLICITED", text: "No cumple el perfil solicitado" },
    { value: "BS_WAS_COVERED", text: "Ya se cubrió la vacante" },
    { value: "BS_NOT_REQUIRED", text: "Ya no requiero cubrir la vacante" },
    { value: "BS_USER_NOT_CONTINUE", text: "El postulante decide no continuar con el proceso" },
    { value: "OTHER", text: "Otro" },
]

// *******************************************************************

export const typeKnowledge = [
    { value: "SOFTWARE", text: "Software" },
    { value: "LANGUAGE", text: "Lenguaje" },
    { value: "OTHER", text: "Otro" },
]

export const levelKnowledge = [
    { value: "BEGINNER", text: "Principiante" },
    { value: "INTERMEDIATE", text: "Intermedio" },
    { value: "ADVANCED", text: "Avanzado" },
]

export const typeKnowledgeMap = new Map([
    [
        'SOFTWARE',
        {
            value: 'SOFTWARE',
            text: "Software",
        },
    ],
    [
        'LANGUAGE',
        {
            value: 'LANGUAGE',
            text: "Lenguaje",
        },
    ],
    [
        'OTHER',
        {
            value: 'OTHER',
            text: "Otro",
        },
    ],
])

export const levelKnowledgeMap = new Map([
    [
        'BEGINNER',
        {
            value: 'BEGINNER',
            text: "Principiante",
        },
    ],
    [
        'INTERMEDIATE',
        {
            value: 'INTERMEDIATE',
            text: "Intermedio",
        },
    ],
    [
        'ADVANCED',
        {
            value: 'ADVANCED',
            text: "Avanzado",
        },
    ],
])

export const lineBusinessMap = new Map([
    [
        'EDUCATIONAL',
        {
            value: 'EDUCATIONAL',
            text: "Educativo",
        },
    ],
    [
        'GOVERNMENT',
        {
            value: 'GOVERNMENT',
            text: "Gobierno",
        },
    ],
    [
        'HEALTH',
        {
            value: 'HEALTH',
            text: "Salud",
        },
    ],
    [
        'ENVIRONMENT',
        {
            value: 'ENVIRONMENT',
            text: "Medio ambiente",
        },
    ],
    [
        'TOURISM',
        {
            value: 'TOURISM',
            text: "Turismo",
        },
    ],
    [
        'FOOD_AND_DRINKS',
        {
            value: 'FOOD_AND_DRINKS',
            text: "Alimentos y bebidas",
        },
    ],
    [
        'COMMUNICATION',
        {
            value: 'COMMUNICATION',
            text: "Comunicación",
        },
    ],
    [
        'CONSTRUCTION_AND_DESIGN',
        {
            value: 'CONSTRUCTION_AND_DESIGN',
            text: "Construcción y diseño",
        },
    ],
    [
        'ADMINISTRATION',
        {
            value: 'ADMINISTRATION',
            text: "Administración",
        },
    ],
    [
        'MANUFACTURE',
        {
            value: 'MANUFACTURE',
            text: "Manufactura",
        },
    ],
    [
        'OTHER',
        {
            value: 'OTHER',
            text: "Otro",
        },
    ],
])


export const daysValue = [
    { value: "Lunes", text: "Lunes" },
    { value: "Martes", text: "Martes" },
    { value: "Miércoles", text: "Miércoles" },
    { value: "Jueves", text: "Jueves" },
    { value: "Viernes", text: "Viernes" },
    { value: "Sábado", text: "Sábado" },
    { value: "Domingo", text: "Domingo" },

]

export const daysBirth = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    text: (i + 1).toString(),
}));

export const monthBirth = [
    { value: 1, text: "Enero" },
    { value: 2, text: "Febrero" },
    { value: 3, text: "Marzo" },
    { value: 4, text: "Abril" },
    { value: 5, text: "Mayo" },
    { value: 6, text: "Junio" },
    { value: 7, text: "Julio" },
    { value: 8, text: "Agosto" },
    { value: 9, text: "Septiembre" },
    { value: 10, text: "Octubre" },
    { value: 11, text: "Noviembre" },
    { value: 12, text: "Diciembre" }
]

export const vacantType = [
    { value: 'JOB_POSITION', text: "Laboral" },
    { value: 'PROFESSIONAL_PRACTICE', text: "Prácticas profesionales" },
]