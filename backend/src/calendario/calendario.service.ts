import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarioService {
  constructor(private prisma: PrismaService) {}

  async getSolicitudesPorMes(anio: number, mes: number) {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);

    return this.prisma.solicitud.findMany({
      where: {
        estado: 'Aprobado',
        OR: [
          {
            fechaInicio: {
              gte: inicioMes,
              lte: finMes,
            },
          },
          {
            fechaFin: {
              gte: inicioMes,
              lte: finMes,
            },
          },
          {
            AND: [
              { fechaInicio: { lte: inicioMes } },
              { fechaFin: { gte: finMes } },
            ],
          },
        ],
      },
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        tipoSolicitud: true,
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async getEstadisticasMes(anio: number, mes: number) {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);
    const diasEnMes = new Date(anio, mes, 0).getDate();

    const solicitudes = await this.getSolicitudesPorMes(anio, mes);

    let diasOcupados = 0;
    solicitudes.forEach((solicitud) => {
      const inicio =
        solicitud.fechaInicio > inicioMes ? solicitud.fechaInicio : inicioMes;
      const fin = solicitud.fechaFin < finMes ? solicitud.fechaFin : finMes;
      const diff = fin.getTime() - inicio.getTime();
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
      diasOcupados += dias;
    });

    const porTipo = await this.prisma.solicitud.groupBy({
      by: ['tipoSolicitudId'],
      where: {
        estado: 'Aprobado',
        fechaInicio: {
          gte: inicioMes,
          lte: finMes,
        },
      },
      _sum: {
        diasSolicitados: true,
      },
    });

    const tiposSolicitud = await this.prisma.tipoSolicitud.findMany();
    const estadisticasPorTipo = tiposSolicitud.map((tipo) => {
      const stat = porTipo.find((p) => p.tipoSolicitudId === tipo.id);
      return {
        tipo: tipo.nombre,
        dias: stat?._sum.diasSolicitados || 0,
      };
    });

    return {
      diasEnMes,
      diasOcupados,
      diasDisponibles: diasEnMes - diasOcupados,
      permisosActivos: solicitudes.length,
      porTipo: estadisticasPorTipo,
    };
  }
}
