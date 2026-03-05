import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

    @Post()
    create(@Body() body: { name: string; description: string }, @Req() req: any) {
        const ownerId = req.headers['x-user-id'] || 'anonymous';
        return this.projectsService.create(body.name, body.description, ownerId);
    }

    @Get()
    findAll(@Req() req: any) {
        const ownerId = req.headers['x-user-id'] || 'anonymous';
        return this.projectsService.findAll(ownerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: { name: string; description: string }) {
        return this.projectsService.update(id, body.name, body.description);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }
}