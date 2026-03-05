import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';

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

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    create(@Body() body: {
        title: string;
        description?: string;
        priority?: Priority;
        dueDate?: Date;
        projectId: string;
    }, @Req() req: any) {
        const createdById = req.headers['x-user-id'] || 'anonymous';
        return this.tasksService.create({ ...body, createdById });
    }

    @Get('project/:projectId')
    findAll(@Param('projectId') projectId: string, @Query('status') status?: Status) {
        return this.tasksService.findAll(projectId, status);
    }

    @Get('analytics/:projectId')
    getAnalytics(@Param('projectId') projectId: string) {
        return this.tasksService.getAnalytics(projectId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: {
        title?: string;
        description?: string;
        status?: Status;
        priority?: Priority;
        dueDate?: Date;
    }) {
        return this.tasksService.update(id, body);
    }

    @Put(':id/assign')
    assign(@Param('id') id: string, @Body() body: { assigneeId: string }) {
        return this.tasksService.assign(id, body.assigneeId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}