import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const AUTH_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  locale: true,
  defaultCurrency: true,
  picture: true,
  registrationStatus: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const apiKey = randomBytes(32).toString('hex');

    if (existing) {
      if (
        existing.registrationStatus === 'CONFIRMED' &&
        existing.deletedAt === null
      ) {
        throw new ConflictException('Email already registered');
      }

      const user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          apiKey,
          registrationStatus: 'CONFIRMED',
          deletedAt: null,
        },
        select: AUTH_USER_SELECT,
      });

      return { user, apiKey };
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        apiKey,
      },
      select: AUTH_USER_SELECT,
    });

    return { user, apiKey };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || user.registrationStatus !== 'CONFIRMED') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash, apiKey, deletedAt, ...safeUser } = user;

    return { user: safeUser, apiKey };
  }

  async rotateKey(userId: string) {
    const apiKey = randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: { id: userId },
      data: { apiKey },
    });

    return { apiKey };
  }
}
