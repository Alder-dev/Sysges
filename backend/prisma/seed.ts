import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Tipos de Empleado
  console.log('📋 Creando tipos de empleado...');
  const tipoAdmin = await prisma.tipoEmpleado.create({
    data: {
      nombreTipo: 'Administrativo',
      descripcion: 'Personal administrativo',
    },
  });

  const tipoOperativo = await prisma.tipoEmpleado.create({
    data: {
      nombreTipo: 'Operativo',
      descripcion: 'Personal operativo',
    },
  });

  const tipoDirectivo = await prisma.tipoEmpleado.create({
    data: {
      nombreTipo: 'Directivo',
      descripcion: 'Personal directivo',
    },
  });

  // 2. Tipos de Solicitud (CON NUEVOS CAMPOS)
  console.log('📝 Creando tipos de solicitud...');
  const tipoVacaciones = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Vacaciones',
      descripcion:
        'Solicitud de vacaciones anuales según el Código Sustantivo del Trabajo',
      diasDisponibles: 15,
      esVariable: false,
      requiereAprobacion: true,
      requiereDocumento: false,
      unidadTiempo: 'dias',
    },
  });

  const tipoMaternidad = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Maternidad',
      descripcion: 'Licencia de maternidad remunerada según Ley 1822 de 2017',
      diasDisponibles: 126, // 18 semanas
      esVariable: false,
      requiereAprobacion: true,
      requiereDocumento: true,
      unidadTiempo: 'dias',
    },
  });

  const tipoPaternidad = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Paternidad',
      descripcion: 'Licencia de paternidad remunerada según Ley 1822 de 2017',
      diasDisponibles: 28, // Ajustado según ley colombiana actualizada
      esVariable: false,
      requiereAprobacion: true,
      requiereDocumento: true,
      unidadTiempo: 'dias',
    },
  });

  const tipoIncapacidad = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Incapacidad',
      descripcion: 'Incapacidad médica según Ley 776 de 2002 o EPS',
      diasDisponibles: null, // Variable según certificado médico
      esVariable: true,
      requiereAprobacion: false, // Se aprueba automáticamente con certificado
      requiereDocumento: true,
      unidadTiempo: 'dias',
    },
  });

  const tipoLuto = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Luto',
      descripcion:
        'Licencia remunerada por fallecimiento de familiar (Ley 1280 de 2009)',
      diasDisponibles: 5,
      esVariable: false,
      requiereAprobacion: true,
      requiereDocumento: true,
      unidadTiempo: 'dias',
    },
  });

  const tipoCalamidad = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Calamidad Doméstica',
      descripcion:
        'Licencia por calamidad doméstica según el Código Sustantivo del Trabajo',
      diasDisponibles: null, // Variable según gravedad
      esVariable: true,
      requiereAprobacion: true,
      requiereDocumento: true,
      unidadTiempo: 'dias',
    },
  });

  const tipoLactancia = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Lactancia',
      descripcion: 'Permiso diario de lactancia según Art. 238 del CST',
      diasDisponibles: 60, // 60 minutos diarios (2 descansos de 30 min)
      esVariable: false,
      requiereAprobacion: false, // Es un derecho automático
      requiereDocumento: true, // Certificado de nacimiento
      unidadTiempo: 'minutos',
    },
  });

  const tipoOtro = await prisma.tipoSolicitud.create({
    data: {
      nombre: 'Otro',
      descripcion: 'Otro tipo de solicitud',
      diasDisponibles: null, // Variable
      esVariable: true,
      requiereAprobacion: true,
      requiereDocumento: false,
      unidadTiempo: 'dias',
    },
  });

  // 3. Políticas
  console.log('📜 Creando políticas...');
  await prisma.politica.createMany({
    data: [
      {
        nombre: 'Vacaciones',
        descripcion:
          'Por cada año de servicio según el Código Sustantivo del Trabajo - Art. 186',
        diasAnuales: 15,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Licencia de Maternidad',
        descripcion:
          'Licencia remunerada preparto y posparto según Ley 1822 de 2017 (18 semanas)',
        diasAnuales: 126,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Licencia de Paternidad',
        descripcion:
          'Licencia remunerada por nacimiento según Ley 1822 de 2017',
        diasAnuales: 8,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Licencia Médica',
        descripcion:
          'Según incapacidad certificada por EPS o medicina laboral (Ley 776 de 2002)',
        diasAnuales: 0,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Licencia por Luto',
        descripcion:
          'Por fallecimiento de familiar hasta 2° grado según Ley 1280 de 2009 (5 días hábiles)',
        diasAnuales: 5,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Calamidad Doméstica',
        descripcion:
          'Según gravedad de la situación, de acuerdo con el Código Sustantivo del Trabajo',
        diasAnuales: 0,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Lactancia',
        descripcion:
          'Dos descansos de 30 minutos diarios durante los primeros 6 meses según Art. 238 del CST',
        diasAnuales: 0,
        tipoEmpleadoId: tipoAdmin.id,
      },
      {
        nombre: 'Otro',
        descripcion: 'Otros tipos de permisos no contemplados en el CST',
        diasAnuales: 0,
        tipoEmpleadoId: tipoAdmin.id,
      },
    ],
  });

  // 4. Empleados
  console.log('👥 Creando empleados...');
  const passwordSupervisor = await bcrypt.hash('Admin123!', 10);
  const passwordEmpleado1 = await bcrypt.hash('Empleado123!', 10);
  const passwordEmpleado2 = await bcrypt.hash('Empleado123!', 10);

  // Supervisor/Admin
  const supervisor = await prisma.empleado.create({
    data: {
      nombre: 'María',
      apellido: 'Rodríguez',
      correo: 'supervisor@comfachoco.com',
      cargo: 'Supervisor General',
      departamento: 'Recursos Humanos',
      fechaIngreso: new Date('2020-01-15'),
      tipoEmpleadoId: tipoDirectivo.id,
      password: passwordSupervisor,
    },
  });

  // Empleado regular 1
  const empleado1 = await prisma.empleado.create({
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan.perez@comfachoco.com',
      cargo: 'Analista',
      departamento: 'Administración',
      fechaIngreso: new Date('2022-03-10'),
      tipoEmpleadoId: tipoAdmin.id,
      supervisorId: supervisor.id,
      password: passwordEmpleado1,
    },
  });

  // Empleado regular 2
  const empleado2 = await prisma.empleado.create({
    data: {
      nombre: 'Andrea',
      apellido: 'González',
      correo: 'andrea.gonzalez@comfachoco.com',
      cargo: 'Contadora',
      departamento: 'Contabilidad',
      fechaIngreso: new Date('2021-06-01'),
      tipoEmpleadoId: tipoAdmin.id,
      supervisorId: supervisor.id,
      password: passwordEmpleado2,
    },
  });

  // 5. Saldo de Días (ACTUALIZADO - ahora por tipo de solicitud)
  console.log('💰 Creando saldos de días...');
  const anioActual = new Date().getFullYear();

  // Saldo general de vacaciones para todos
  await prisma.saldoDias.createMany({
    data: [
      // Supervisor - Vacaciones
      {
        empleadoId: supervisor.id,
        tipoSolicitudId: tipoVacaciones.id,
        totalDias: 20,
        diasUsados: 5,
        diasDisponibles: 15,
        anio: anioActual,
      },
      // Empleado 1 - Vacaciones
      {
        empleadoId: empleado1.id,
        tipoSolicitudId: tipoVacaciones.id,
        totalDias: 15,
        diasUsados: 0,
        diasDisponibles: 15,
        anio: anioActual,
      },
      // Empleado 2 - Vacaciones
      {
        empleadoId: empleado2.id,
        tipoSolicitudId: tipoVacaciones.id,
        totalDias: 15,
        diasUsados: 3,
        diasDisponibles: 12,
        anio: anioActual,
      },
      // Empleado 2 también tiene saldo de maternidad (ejemplo)
      {
        empleadoId: empleado2.id,
        tipoSolicitudId: tipoMaternidad.id,
        totalDias: 126,
        diasUsados: 0,
        diasDisponibles: 126,
        anio: anioActual,
      },
    ],
  });

  // 6. Solicitudes de ejemplo
  console.log('📬 Creando solicitudes de ejemplo...');
  const solicitud1 = await prisma.solicitud.create({
    data: {
      empleadoId: empleado1.id,
      tipoSolicitudId: tipoVacaciones.id,
      fechaInicio: new Date('2025-11-01'),
      fechaFin: new Date('2025-11-05'),
      diasSolicitados: 5,
      estado: 'Pendiente',
      motivo: 'Vacaciones familiares',
    },
  });

  const solicitud2 = await prisma.solicitud.create({
    data: {
      empleadoId: empleado2.id,
      tipoSolicitudId: tipoVacaciones.id,
      fechaInicio: new Date('2025-12-15'),
      fechaFin: new Date('2025-12-20'),
      diasSolicitados: 6,
      estado: 'Aprobado',
      motivo: 'Viaje de fin de año',
    },
  });

  // Solicitud de luto (ejemplo)
  const solicitud3 = await prisma.solicitud.create({
    data: {
      empleadoId: empleado1.id,
      tipoSolicitudId: tipoLuto.id,
      fechaInicio: new Date('2025-10-28'),
      fechaFin: new Date('2025-11-01'),
      diasSolicitados: 5,
      estado: 'Aprobado',
      motivo: 'Fallecimiento de familiar directo',
    },
  });

  // 7. Aprobaciones de ejemplo
  await prisma.aprobacion.createMany({
    data: [
      {
        solicitudId: solicitud2.id,
        aprobadorId: supervisor.id,
        decision: 'Aprobado',
        comentarios: 'Aprobado. Disfruta tus vacaciones.',
      },
      {
        solicitudId: solicitud3.id,
        aprobadorId: supervisor.id,
        decision: 'Aprobado',
        comentarios: 'Mis condolencias. Aprobado.',
      },
    ],
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📊 Datos creados:');
  console.log(`- 3 tipos de empleado`);
  console.log(`- 8 tipos de solicitud (con nuevos campos)`);
  console.log(`- 3 empleados`);
  console.log(`- 3 solicitudes`);
  console.log(`- 4 registros de saldo de días`);
  console.log('\n🔐 Credenciales de prueba:');
  console.log('Supervisor: supervisor@comfachoco.com / Admin123!');
  console.log('Empleado 1: juan.perez@comfachoco.com / Empleado123!');
  console.log('Empleado 2: andrea.gonzalez@comfachoco.com / Empleado123!');
  console.log('\n💡 Tipos de solicitud configurados:');
  console.log('- Vacaciones: 15 días');
  console.log('- Maternidad: 126 días (18 semanas)');
  console.log('- Paternidad: 28 días');
  console.log('- Incapacidad: Variable (requiere documento)');
  console.log('- Luto: 5 días');
  console.log('- Calamidad: Variable');
  console.log('- Lactancia: 60 minutos diarios');
  console.log('- Otro: Variable');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
