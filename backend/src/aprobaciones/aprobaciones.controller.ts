import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AprobacionesService } from './aprobaciones.service';
import { CreateAprobacionDto } from './dto/create-aprobacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('aprobaciones')
@UseGuards(JwtAuthGuard)
export class AprobacionesController {
  constructor(private readonly aprobacionesService: AprobacionesService) {}

  @Post()
  create(@Body() createAprobacionDto: CreateAprobacionDto, @Request() req) {
    return this.aprobacionesService.create(createAprobacionDto, req.user.id);
  }
}
