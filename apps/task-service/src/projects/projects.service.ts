import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(name: string, description: string, ownerId: string) {
        return this.prisma.project.create({
            data: { name, description, ownerId },
        });
    }

    async findAll(ownerId: string) {
        return this.prisma.project.findMany({
            where: { ownerId },
            include: { _count: { select: { tasks: true } } },
        });
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { tasks: true },
        });
        if (!project) throw new NotFoundException('Project tidak ditemukan');
        return project;
    }

    async update(id: string, name: string, description: string) {
        return this.prisma.project.update({
            where: { id },
            data: { name, description },
        });
    }

    async remove(id: string) {
        return this.prisma.project.delete({ where: { id } });
    }
}