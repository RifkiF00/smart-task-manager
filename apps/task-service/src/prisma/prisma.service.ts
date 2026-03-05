import { Injectable, OnModuleInit } from '@nestjs/common';

const { PrismaClient } = require('../../node_modules/.prisma/client');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }
}