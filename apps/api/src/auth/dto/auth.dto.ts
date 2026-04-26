import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Department } from '@ems/shared';

export class RegisterDto {
  
  @IsEmail()
  email!: string;

  
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Must contain at least one number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Must contain at least one special character' })
  password!: string;

  
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName!: string;

  
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName!: string;

  
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  
  @IsString()
  @IsOptional()
  department?: Department;
}

export class LoginDto {
  
  @IsEmail()
  email!: string;

  
  @IsString()
  @MinLength(1)
  password!: string;
}

export class ForgotPasswordDto {
  
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  
  @IsString()
  @MinLength(1)
  token!: string;

  
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Must contain uppercase letter' })
  @Matches(/[0-9]/, { message: 'Must contain number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Must contain special character' })
  password!: string;
}

export class ChangePasswordDto {
  
  @IsString()
  currentPassword!: string;

  
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  @Matches(/[^A-Za-z0-9]/)
  newPassword!: string;
}
