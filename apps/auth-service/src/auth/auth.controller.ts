import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(
        @Body() body: { email: string; password: string; name: string },
    ) {
        return this.authService.register(body.email, body.password, body.name);
    }

    @Post('login')
    login(
        @Body() body: { email: string; password: string },
    ) {
        return this.authService.login(body.email, body.password);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: any) {
        return this.authService.logout(req.user.sub);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Req() req: any) {
        return req.user;
    }
}