import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAprobacionDto } from './dto/create-aprobacion.dto';

@Injectable()
export class AprobacionesService {
  constructor(private prisma: PrismaService) {}

  async create(createAprobacionDto: CreateAprobacionDto, aprobadorId: number) {
    const { solicitudId, decision, comentarios } = createAprobacionDto;

    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con ID ${solicitudId} no encontrada`,
      );
    }

    if (solicitud.estado !== 'Pendiente') {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    return this.prisma.$transaction(async (tx) => {
      const aprobacion = await tx.aprobacion.create({
        data: {
          solicitudId,
          aprobadorId,
          decision,
          comentarios,
        },
        include: {
          solicitud: {
            include: {
              empleado: true,
              tipoSolicitud: true,
            },
          },
        },
      });

      const estadoSolicitud =
        decision === 'Aprobado' ? 'Aprobado' : 'Rechazado';
      await tx.solicitud.update({
        where: { id: solicitudId },
        data: { estado: estadoSolicitud },
      });

      if (decision === 'Aprobado') {
        const anio = new Date().getFullYear();

        await tx.saldoDias.updateMany({
          where: {
            empleadoId: solicitud.empleadoId,
            anio,
          },
          data: {
            diasUsados: { increment: solicitud.diasSolicitados },
            diasDisponibles: { decrement: solicitud.diasSolicitados },
          },
        });
      }

      return aprobacion;
    });
  }
}
