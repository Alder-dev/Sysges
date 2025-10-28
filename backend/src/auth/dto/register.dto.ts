import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no debe exceder 128 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)',
    },
  )
  password: string;

  @IsString({ message: 'El nombre es requerido' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString({ message: 'El apellido es requerido' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsString({ message: 'El cargo es requerido' })
  @IsNotEmpty({ message: 'El cargo es requerido' })
  cargo: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsDateString({}, { message: 'La fecha de ingreso debe ser válida' })
  @IsOptional()
  fechaIngreso?: string;

  @IsInt({ message: 'El tipo de empleado debe ser un número' })
  @IsOptional()
  tipoEmpleadoId?: number;

  @IsInt({ message: 'El supervisor debe ser un número' })
  @IsOptional()
  supervisorId?: number;
}
