import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const {
      correo,
      password,
      nombre,
      apellido,
      cargo,
      departamento,
      fechaIngreso,
      tipoEmpleadoId,
      supervisorId,
    } = registerDto;

    // Verificar si el correo ya existe
    const empleadoExistente = await this.prisma.empleado.findUnique({
      where: { correo },
    });

    if (empleadoExistente) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Crear el empleado
    const empleado = await this.prisma.empleado.create({
      data: {
        correo,
        password: passwordHash,
        nombre,
        apellido,
        cargo,
        departamento,
        fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
        tipoEmpleadoId: tipoEmpleadoId || null,
        supervisorId: supervisorId || null,
      },
      include: {
        tipoEmpleado: true,
      },
    });

    // Crear saldo de días para el año actual
    const anioActual = new Date().getFullYear();
    await this.prisma.saldoDias.create({
      data: {
        empleadoId: empleado.id,
        anio: anioActual,
        totalDias: 15,
        diasDisponibles: 15,
        diasUsados: 0,
      },
    });

    // Generar token JWT
    const payload = {
      sub: empleado.id,
      correo: empleado.correo,
      tipo: empleado.tipoEmpleado?.nombreTipo,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      empleado: {
        id: empleado.id,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        correo: empleado.correo,
        cargo: empleado.cargo,
        tipo: empleado.tipoEmpleado?.nombreTipo,
        diasDisponibles: 15,
      },
      message: 'Usuario registrado exitosamente',
    };
  }

  async login(loginDto: LoginDto) {
    const { correo, password } = loginDto;

    // Buscar empleado por correo
    const empleado = await this.prisma.empleado.findUnique({
      where: { correo },
      include: {
        tipoEmpleado: true,
        saldoDias: {
          where: { anio: new Date().getFullYear() },
        },
      },
    });

    // Si no existe el empleado, lanzar error genérico
    if (!empleado) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el empleado tiene contraseña
    if (!empleado.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar contraseñas
    const passwordValido = await bcrypt.compare(password, empleado.password);

    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
    const payload = {
      sub: empleado.id,
      correo: empleado.correo,
      tipo: empleado.tipoEmpleado?.nombreTipo,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      empleado: {
        id: empleado.id,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        correo: empleado.correo,
        cargo: empleado.cargo,
        departamento: empleado.departamento,
        tipo: empleado.tipoEmpleado?.nombreTipo,
        diasDisponibles: empleado.saldoDias[0]?.diasDisponibles || 0,
      },
    };
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
}
