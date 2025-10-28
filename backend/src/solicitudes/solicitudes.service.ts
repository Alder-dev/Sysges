import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { EstadoSolicitud } from '@prisma/client';

@Injectable()
export class SolicitudesService {
  constructor(private prisma: PrismaService) {}

  async create(createSolicitudDto: CreateSolicitudDto, empleadoId: number) {
    const { tipoSolicitudId, fechaInicio, fechaFin, motivo } =
      createSolicitudDto;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diasSolicitados =
      Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
      1;

    if (diasSolicitados <= 0) {
      throw new BadRequestException('Las fechas son inválidas');
    }

    const anio = new Date().getFullYear();
    const saldo = await this.prisma.saldoDias.findFirst({
      where: { empleadoId, anio },
    });

    if (!saldo || saldo.diasDisponibles < diasSolicitados) {
      throw new BadRequestException('No tienes suficientes días disponibles');
    }

    // Verificar si hay solapamiento con otras solicitudes aprobadas
    const haySolapamiento = await this.verificarSolapamiento(
      empleadoId,
      inicio,
      fin,
    );

    if (haySolapamiento) {
      throw new BadRequestException(
        'Ya tienes un permiso aprobado para las fechas seleccionadas. Por favor, elige otras fechas.',
      );
    }

    return this.prisma.solicitud.create({
      data: {
        empleadoId,
        tipoSolicitudId,
        fechaInicio: inicio,
        fechaFin: fin,
        diasSolicitados,
        motivo,
        estado: 'Pendiente',
      },
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
            cargo: true,
          },
        },
        tipoSolicitud: true,
      },
    });
  }

  async findByEmpleado(empleadoId: number) {
    return this.prisma.solicitud.findMany({
      where: { empleadoId },
      include: {
        tipoSolicitud: true,
        documentos: true,
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  async findByEstado(estado: EstadoSolicitud) {
    return this.prisma.solicitud.findMany({
      where: { estado },
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
            cargo: true,
            correo: true,
          },
        },
        tipoSolicitud: true,
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  async findOne(id: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        empleado: true,
        tipoSolicitud: true,
        aprobaciones: {
          include: {
            aprobador: {
              select: {
                nombre: true,
                apellido: true,
                cargo: true,
              },
            },
          },
        },
        documentos: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  private async verificarSolapamiento(
    empleadoId: number,
    fechaInicio: Date,
    fechaFin: Date,
    solicitudId?: number,
  ) {
    const solicitudesExistentes = await this.prisma.solicitud.findMany({
      where: {
        empleadoId,
        estado: 'Aprobado',
        id: { not: solicitudId }, // Excluir la solicitud actual si se proporciona un ID
        OR: [
          {
            AND: [
              { fechaInicio: { lte: fechaFin } },
              { fechaFin: { gte: fechaInicio } },
            ],
          },
        ],
      },
    });

    return solicitudesExistentes.length > 0;
  }

  async aprobar(id: number, aprobadorId: number) {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== 'Pendiente') {
      throw new BadRequestException(
        'Solo se pueden aprobar solicitudes pendientes',
      );
    }

    // Verificar si hay solapamiento con otras solicitudes aprobadas
    const haySolapamiento = await this.verificarSolapamiento(
      solicitud.empleadoId,
      solicitud.fechaInicio,
      solicitud.fechaFin,
      solicitud.id,
    );

    if (haySolapamiento) {
      throw new BadRequestException(
        'No se puede aprobar la solicitud porque el empleado ya tiene un permiso aprobado para las fechas seleccionadas',
      );
    }

    // Actualizar la solicitud
    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: 'Aprobado',
        updatedAt: new Date(),
        aprobaciones: {
          create: {
            aprobadorId,
            decision: 'Aprobado',
          },
        },
      },
      include: {
        empleado: true,
        tipoSolicitud: true,
      },
    });

    // Actualizar saldo de días
    await this.prisma.saldoDias.updateMany({
      where: {
        empleadoId: solicitud.empleadoId,
        anio: new Date().getFullYear(),
      },
      data: {
        diasDisponibles: {
          decrement: solicitud.diasSolicitados,
        },
        diasUsados: {
          increment: solicitud.diasSolicitados,
        },
      },
    });

    return solicitudActualizada;
  }

  async rechazar(id: number, aprobadorId: number) {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== 'Pendiente') {
      throw new BadRequestException(
        'Solo se pueden rechazar solicitudes pendientes',
      );
    }

    return this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: 'Rechazado',
        updatedAt: new Date(),
        aprobaciones: {
          create: {
            aprobadorId,
            decision: 'Rechazado',
          },
        },
      },
      include: {
        empleado: true,
        tipoSolicitud: true,
      },
    });
  }

  async eliminar(id: number) {
    // const solicitud = await this.findOne(id);

    // if (solicitud.estado !== 'Pendiente') {
    //   throw new BadRequestException(
    //     'Solo se pueden eliminar solicitudes pendientes',
    //   );
    // }

    return this.prisma.solicitud.delete({
      where: { id },
    });
  }
}
