-- CreateEnum
CREATE TYPE "estado_solicitud" AS ENUM ('Pendiente', 'Aprobado', 'Rechazado');

-- CreateEnum
CREATE TYPE "decision_aprobacion" AS ENUM ('Aprobado', 'Rechazado');

-- CreateEnum
CREATE TYPE "estado_evento" AS ENUM ('Programado', 'EnCurso', 'Finalizado');

-- CreateTable
CREATE TABLE "tipo_empleado" (
    "id" SERIAL NOT NULL,
    "nombreTipo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tipo_empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleado" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "tipoEmpleadoId" INTEGER,
    "cargo" VARCHAR(100),
    "departamento" VARCHAR(100),
    "correo" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255),
    "fechaIngreso" DATE NOT NULL,
    "supervisorId" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politica" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "diasAnuales" INTEGER DEFAULT 0,
    "tipoEmpleadoId" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "politica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_solicitud" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "diasDisponibles" INTEGER,
    "esVariable" BOOLEAN NOT NULL DEFAULT false,
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT true,
    "requiereDocumento" BOOLEAN NOT NULL DEFAULT false,
    "unidadTiempo" VARCHAR(20),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tipo_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "tipoSolicitudId" INTEGER NOT NULL,
    "politicaId" INTEGER,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "diasSolicitados" INTEGER NOT NULL,
    "estado" "estado_solicitud" NOT NULL DEFAULT 'Pendiente',
    "fechaSolicitud" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprobacion" (
    "id" SERIAL NOT NULL,
    "solicitudId" INTEGER NOT NULL,
    "aprobadorId" INTEGER NOT NULL,
    "fechaAprobacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" "decision_aprobacion" NOT NULL,
    "comentarios" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "aprobacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldo_dias" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "tipoSolicitudId" INTEGER,
    "totalDias" INTEGER NOT NULL DEFAULT 0,
    "diasUsados" INTEGER NOT NULL DEFAULT 0,
    "diasDisponibles" INTEGER NOT NULL DEFAULT 0,
    "anio" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "saldo_dias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario" (
    "id" SERIAL NOT NULL,
    "solicitudId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "tipoEvento" VARCHAR(50),
    "estado" "estado_evento" NOT NULL DEFAULT 'Programado',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "calendario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento" (
    "id" SERIAL NOT NULL,
    "solicitudId" INTEGER NOT NULL,
    "nombreArchivo" VARCHAR(200) NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "tipoDocumento" VARCHAR(100),
    "fechaSubida" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empleado_correo_key" ON "empleado"("correo");

-- CreateIndex
CREATE INDEX "idx_empleado_supervisor" ON "empleado"("supervisorId");

-- CreateIndex
CREATE INDEX "empleado_tipoEmpleadoId_idx" ON "empleado"("tipoEmpleadoId");

-- CreateIndex
CREATE INDEX "empleado_correo_idx" ON "empleado"("correo");

-- CreateIndex
CREATE INDEX "idx_solicitud_empleado" ON "solicitud"("empleadoId");

-- CreateIndex
CREATE INDEX "idx_solicitud_estado" ON "solicitud"("estado");

-- CreateIndex
CREATE INDEX "solicitud_fechaInicio_fechaFin_idx" ON "solicitud"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "aprobacion_solicitudId_idx" ON "aprobacion"("solicitudId");

-- CreateIndex
CREATE INDEX "aprobacion_aprobadorId_idx" ON "aprobacion"("aprobadorId");

-- CreateIndex
CREATE INDEX "idx_saldo_empleado_anio" ON "saldo_dias"("empleadoId", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "saldo_dias_empleadoId_anio_tipoSolicitudId_key" ON "saldo_dias"("empleadoId", "anio", "tipoSolicitudId");

-- CreateIndex
CREATE INDEX "calendario_solicitudId_idx" ON "calendario"("solicitudId");

-- CreateIndex
CREATE INDEX "calendario_fecha_idx" ON "calendario"("fecha");

-- CreateIndex
CREATE INDEX "documento_solicitudId_idx" ON "documento"("solicitudId");

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_tipoEmpleadoId_fkey" FOREIGN KEY ("tipoEmpleadoId") REFERENCES "tipo_empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "politica" ADD CONSTRAINT "politica_tipoEmpleadoId_fkey" FOREIGN KEY ("tipoEmpleadoId") REFERENCES "tipo_empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_tipoSolicitudId_fkey" FOREIGN KEY ("tipoSolicitudId") REFERENCES "tipo_solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud" ADD CONSTRAINT "solicitud_politicaId_fkey" FOREIGN KEY ("politicaId") REFERENCES "politica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobacion" ADD CONSTRAINT "aprobacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobacion" ADD CONSTRAINT "aprobacion_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo_dias" ADD CONSTRAINT "saldo_dias_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo_dias" ADD CONSTRAINT "saldo_dias_tipoSolicitudId_fkey" FOREIGN KEY ("tipoSolicitudId") REFERENCES "tipo_solicitud"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendario" ADD CONSTRAINT "calendario_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitud"("id") ON DELETE CASCADE ON UPDATE CASCADE;
