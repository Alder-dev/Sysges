import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  create(@Body() createSolicitudDto: CreateSolicitudDto, @Request() req) {
    return this.solicitudesService.create(createSolicitudDto, req.user.id);
  }

  @Get('mis-solicitudes')
  findMyRequests(@Request() req) {
    return this.solicitudesService.findByEmpleado(req.user.id);
  }

  @Get('pendientes')
  findPending() {
    return this.solicitudesService.findByEstado('Pendiente');
  }

  @Get('aprobadas')
  findApproved() {
    return this.solicitudesService.findByEstado('Aprobado');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.findOne(id);
  }

  @Put(':id/aprobar')
  aprobar(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.solicitudesService.aprobar(id, req.user.id);
  }

  @Put(':id/rechazar')
  rechazar(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.solicitudesService.rechazar(id, req.user.id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.eliminar(id);
  }
}
