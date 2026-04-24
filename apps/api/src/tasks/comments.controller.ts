import { 
  Controller, Get, Post, Body, Param, Delete, 
  UseGuards, Request 
} from '@nestjs/common';
import { TaskCommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Task Comments')
@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class TaskCommentsController {
  constructor(private readonly commentsService: TaskCommentsService) {}

  @Post()
  create(
    @Param('taskId') taskId: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.commentsService.create(taskId, req.user.id, content);
  }

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.remove(id, req.user.id);
  }
}

// Dummy decorator for TS if needed
function ApiTags(name: string) { return (constructor: Function) => {} }
