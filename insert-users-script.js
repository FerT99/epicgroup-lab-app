// Script para insertar usuarios del Colegio IPDC en Supabase
// Ejecutar este script desde la consola del navegador o como función en tu aplicación

import { supabase } from './src/lib/supabase'

// Datos de usuarios del CSV (primeros 20 usuarios como ejemplo)
const usersData = [
  {
    email: 'pdc-01180137@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'ENRIQUE RAMOS VALERIO',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170434@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'MAXIMO TADEO FARIAS SANCHEZ',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-08231416@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'FABIAN SAEZ ESCOBAR',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170273@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'ERIKA ORTIZ RIOJAS',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09210775@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'PABLO SANTIAGO FARIAS LOZANO',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170171@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'MIA AMELIE RAMIREZ HERMANN',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-01231206@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'REGINA IGLESIAS SOLANO',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-03231298@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'DENISSE DANIELA CHAVEZ LOPEZ',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-02231227@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'ROSA VICTORIA PEREZ FAUTRÉ',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-07231395@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'EMILIANO VALLEJO FLORES',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-08200600@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'JUAN PABLO GUEVARA LORIA',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170246@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'MARIA FERNANDA ACEVEDO SALCEDO',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170430@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'YUMA MÖSL RÖCK',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170466@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'FLOR DE LIZ BETANCOURT CONTRERAS',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-02251722@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'ABIGAIL MEDINA GUZMAN',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-08221117@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'MARIA FERNANDA ARCE RUIZ CABAÑAS',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170448@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'ELENA SOPHIA CHABLE BUHLER',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-03241497@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'DAVID SANTIAGO SANCHEZ BADILLO',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-09170326@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'ILEANA ORTIZ SALDAÑA',
    cohort: 'IPDC1'
  },
  {
    email: 'pdc-02220889@colegiosingles.com',
    password: 'ingles2025',
    full_name: 'MATEO MONROY ROMERO',
    cohort: 'IPDC1'
  }
]

// Función para insertar usuarios
async function insertUsers() {
  console.log('Iniciando inserción de usuarios...')
  
  const results = {
    success: 0,
    errors: 0,
    errorDetails: []
  }

  for (const user of usersData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
            cohort: user.cohort
          }
        }
      })

      if (error) {
        console.error(`Error al crear usuario ${user.email}:`, error.message)
        results.errors++
        results.errorDetails.push({
          email: user.email,
          error: error.message
        })
      } else {
        console.log(`✅ Usuario creado: ${user.email}`)
        results.success++
      }

      // Pequeña pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`Error inesperado con ${user.email}:`, error)
      results.errors++
      results.errorDetails.push({
        email: user.email,
        error: error.message
      })
    }
  }

  console.log('\n📊 Resumen de inserción:')
  console.log(`✅ Usuarios creados exitosamente: ${results.success}`)
  console.log(`❌ Errores: ${results.errors}`)
  
  if (results.errorDetails.length > 0) {
    console.log('\n🔍 Detalles de errores:')
    results.errorDetails.forEach(detail => {
      console.log(`- ${detail.email}: ${detail.error}`)
    })
  }

  return results
}

// Función para insertar usuarios por lotes (más eficiente)
async function insertUsersBatch(batchSize = 5) {
  console.log(`Iniciando inserción por lotes de ${batchSize} usuarios...`)
  
  const results = {
    success: 0,
    errors: 0,
    errorDetails: []
  }

  for (let i = 0; i < usersData.length; i += batchSize) {
    const batch = usersData.slice(i, i + batchSize)
    console.log(`Procesando lote ${Math.floor(i / batchSize) + 1}...`)

    const promises = batch.map(async (user) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.full_name,
              cohort: user.cohort
            }
          }
        })

        if (error) {
          results.errors++
          results.errorDetails.push({
            email: user.email,
            error: error.message
          })
          return { success: false, email: user.email, error: error.message }
        } else {
          results.success++
          return { success: true, email: user.email }
        }
      } catch (error) {
        results.errors++
        results.errorDetails.push({
          email: user.email,
          error: error.message
        })
        return { success: false, email: user.email, error: error.message }
      }
    })

    const batchResults = await Promise.all(promises)
    
    // Mostrar resultados del lote
    batchResults.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.email}`)
      } else {
        console.log(`❌ ${result.email}: ${result.error}`)
      }
    })

    // Pausa entre lotes
    if (i + batchSize < usersData.length) {
      console.log('Esperando antes del siguiente lote...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n📊 Resumen final:')
  console.log(`✅ Usuarios creados exitosamente: ${results.success}`)
  console.log(`❌ Errores: ${results.errors}`)

  return results
}

// Exportar funciones para uso
export { insertUsers, insertUsersBatch, usersData }

// Para ejecutar desde la consola del navegador:
// insertUsers() // Inserción secuencial
// insertUsersBatch(5) // Inserción por lotes de 5
