import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { AprobacionesModule } from './aprobaciones/aprobaciones.module';
import { CalendarioModule } from './calendario/calendario.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SolicitudesModule,
    AprobacionesModule,
    CalendarioModule,
  ],
})
export class AppModule {}
