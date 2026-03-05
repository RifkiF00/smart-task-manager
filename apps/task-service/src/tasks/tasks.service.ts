import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';

enum Status {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private eventsService: EventsService,
    ) { }

    async create(data: {
        title: string;
        description?: string;
        priority?: Priority;
        dueDate?: Date;
        projectId: string;
        createdById: string;
    }) {
        const task = await this.prisma.task.create({ data });
        await this.eventsService.publish('task.created', task);
        return task;
    }

    async findAll(projectId: string, status?: Status) {
        return this.prisma.task.findMany({
            where: { projectId, ...(status && { status }) },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException('Task tidak ditemukan');
        return task;
    }

    async update(id: string, data: {
        title?: string;
        description?: string;
        status?: Status;
        priority?: Priority;
        dueDate?: Date;
    }) {
        const task = await this.prisma.task.update({ where: { id }, data });
        await this.eventsService.publish('task.updated', task);
        return task;
    }

    async assign(id: string, assigneeId: string) {
        const task = await this.prisma.task.update({
            where: { id },
            data: { assigneeId },
        });
        await this.eventsService.publish('task.assigned', task);
        return task;
    }

    async remove(id: string) {
        return this.prisma.task.delete({ where: { id } });
    }

    async getAnalytics(projectId: string) {
        const [total, done, inProgress, todo] = await Promise.all([
            this.prisma.task.count({ where: { projectId } }),
            this.prisma.task.count({ where: { projectId, status: 'DONE' } }),
            this.prisma.task.count({ where: { projectId, status: 'IN_PROGRESS' } }),
            this.prisma.task.count({ where: { projectId, status: 'TODO' } }),
        ]);

        return {
            total,
            done,
            inProgress,
            todo,
            completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
        };
    }
}