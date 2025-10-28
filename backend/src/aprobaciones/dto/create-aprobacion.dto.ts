import {
  IsInt,
  IsEnum,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { DecisionAprobacion } from '@prisma/client';

export class CreateAprobacionDto {
  @IsInt()
  @IsNotEmpty()
  solicitudId: number;

  @IsEnum(DecisionAprobacion)
  @IsNotEmpty()
  decision: DecisionAprobacion;

  @IsString()
  @IsOptional()
  comentarios?: string;
}
