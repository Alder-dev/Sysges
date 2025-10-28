import {
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateSolicitudDto {
  @IsInt()
  @IsNotEmpty()
  tipoSolicitudId: number;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}
