import {
  IsEmail, IsString, IsEnum, IsOptional,
  MinLength, MaxLength, IsBoolean, IsArray, IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole, UserStatus, Department } from '@ems/shared';

export class CreateUserDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  role?: UserRole;
  department?: Department;
  position?: string;
  phone?: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: Department;
  position?: string;
  phone?: string;
  password?: string;
  avatarUrl?: string;
}

export class UserFiltersDto {
  @IsString() @IsOptional() search?: string;
  @IsEnum(UserRole) @IsOptional() role?: UserRole;
  @IsEnum(UserStatus) @IsOptional() status?: UserStatus;
  @IsString() @IsOptional() department?: string;
  @Type(() => Number) page: number = 1;
  @Type(() => Number) limit: number = 20;
  @IsIn(['firstName', 'lastName', 'email', 'createdAt', 'role']) @IsOptional() sortBy: string = 'createdAt';
  @IsIn(['asc', 'desc']) @IsOptional() sortOrder: 'asc' | 'desc' = 'desc';
}

export class BulkActionDto {
  ids!: string[];

  @IsIn(['activate', 'deactivate', 'delete']) action!: 'activate' | 'deactivate' | 'delete';
}
