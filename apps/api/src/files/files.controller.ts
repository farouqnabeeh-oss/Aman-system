import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';

const MAX_FILE_MB = parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '50', 10);

import { memoryStorage } from 'multer';

const storage = memoryStorage();

class UpdateFileDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() folderPath?: string;
  @IsString() @IsOptional() visibility?: string;
}



@UseGuards(RolesGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: MAX_FILE_MB * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() actor: RequestUser,
    @Body('folderPath') folderPath?: string,
    @Body('visibility') visibility?: string,
    @Body('department') department?: string,
  ) {
    const data = await this.filesService.uploadFile(file, actor.id, folderPath, visibility, department);
    return { success: true, data };
  }

  @Get()
  async findAll(@CurrentUser() _actor: RequestUser, @Query('folderPath') folderPath?: string, @Query('visibility') visibility?: string, @Query('department') department?: string, @Query('search') search?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.filesService.findAll({ folderPath, visibility, department, search, page: +page, limit: +limit });
    const totalPages = Math.ceil(result.total / +limit);
    return { success: true, data: { items: result.items, meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 } } };
  }

  @Get('folders')
  async getFolders() { return { success: true, data: await this.filesService.getFolders() }; }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFileDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.filesService.updateFile(id, dto, actor.id) };
  }

  @Delete(':id') @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    await this.filesService.deleteFile(id, actor.id, actor.role);
    return { success: true, data: null };
  }
}
