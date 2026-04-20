import {
  IsEmail, IsString, IsEnum, IsOptional,
  MinLength, MaxLength, IsBoolean, IsArray, IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole, UserStatus, Department } from '@ems/shared';

export class CreateUserDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50) firstName!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50) lastName!: string;
  @ApiPropertyOptional({ enum: UserRole }) @IsEnum(UserRole) @IsOptional() role?: UserRole;
  @ApiPropertyOptional({ enum: Department }) @IsEnum(Department) @IsOptional() department?: Department;
  @ApiPropertyOptional() @IsString() @MaxLength(100) @IsOptional() position?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsString() @MinLength(1) @MaxLength(50) @IsOptional() firstName?: string;
  @ApiPropertyOptional() @IsString() @MinLength(1) @MaxLength(50) @IsOptional() lastName?: string;
  @ApiPropertyOptional({ enum: UserRole }) @IsEnum(UserRole) @IsOptional() role?: UserRole;
  @ApiPropertyOptional({ enum: UserStatus }) @IsEnum(UserStatus) @IsOptional() status?: UserStatus;
  @ApiPropertyOptional({ enum: Department }) @IsEnum(Department) @IsOptional() department?: Department;
  @ApiPropertyOptional() @IsString() @MaxLength(100) @IsOptional() position?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() avatarUrl?: string;
}

export class UserFiltersDto {
  @IsString() @IsOptional() search?: string;
  @IsEnum(UserRole) @IsOptional() role?: UserRole;
  @IsEnum(UserStatus) @IsOptional() status?: UserStatus;
  @IsEnum(Department) @IsOptional() department?: Department;
  @Type(() => Number) page: number = 1;
  @Type(() => Number) limit: number = 20;
  @IsIn(['firstName', 'lastName', 'email', 'createdAt', 'role']) @IsOptional() sortBy: string = 'createdAt';
  @IsIn(['asc', 'desc']) @IsOptional() sortOrder: 'asc' | 'desc' = 'desc';
}

export class BulkActionDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) ids!: string[];
  @ApiProperty({ enum: ['activate', 'deactivate', 'delete'] })
  @IsIn(['activate', 'deactivate', 'delete']) action!: 'activate' | 'deactivate' | 'delete';
}
