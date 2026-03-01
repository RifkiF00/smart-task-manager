import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(email: string, password: string, name: string) {
        // cek apakah email sudah terdaftar
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email sudah terdaftar');
        }

        const user = await this.usersService.create(email, password, name);
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            ...tokens,
        };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Email atau password salah');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Email atau password salah');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            ...tokens,
        };
    }

    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
        return { message: 'Logout berhasil' };
    }

    async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
        });

        return { accessToken, refreshToken };
    }
}