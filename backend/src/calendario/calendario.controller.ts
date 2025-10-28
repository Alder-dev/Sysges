import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CalendarioService } from './calendario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('calendario')
@UseGuards(JwtAuthGuard)
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Get(':anio/:mes')
  findByMonth(
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.calendarioService.getSolicitudesPorMes(anio, mes);
  }

  @Get('estadisticas/:anio/:mes')
  getEstadisticas(
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.calendarioService.getEstadisticasMes(anio, mes);
  }
}
