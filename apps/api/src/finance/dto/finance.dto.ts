import {
  IsString, IsEnum, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionStatus, InvoiceStatus, Department, PaymentMethod } from '@ems/shared';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND'] }) @IsEnum(TransactionType) type!: TransactionType;
  @ApiProperty() @IsNumber() @Min(0.01) amount!: number;
  @ApiPropertyOptional() @IsString() @IsOptional() currency?: string;
  @ApiProperty() @IsString() description!: string;
  @ApiProperty() @IsString() category!: string;
  @ApiPropertyOptional({ enum: ['ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 'OPERATIONS', 'SALES', 'LEGAL', 'PRODUCT'] }) @IsEnum(Department) @IsOptional() department?: Department;
  @ApiPropertyOptional() @IsString() @IsOptional() reference?: string;
  @ApiPropertyOptional({ enum: ['BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'CHECK', 'DIGITAL_WALLET'] }) @IsEnum(PaymentMethod) @IsOptional() paymentMethod?: PaymentMethod;
  @ApiPropertyOptional() @IsString() @IsOptional() invoiceId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() transactionDate?: string;
}

export class TransactionFiltersDto {
  @IsEnum(TransactionType) @IsOptional() type?: TransactionType;
  @IsEnum(TransactionStatus) @IsOptional() status?: TransactionStatus;
  @IsEnum(Department) @IsOptional() department?: Department;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() search?: string;
  @IsString() @IsOptional() dateFrom?: string;
  @IsString() @IsOptional() dateTo?: string;
  @Type(() => Number) page: number = 1;
  @Type(() => Number) limit: number = 20;
  @IsIn(['transactionDate', 'amount', 'createdAt']) @IsOptional() sortBy: string = 'transactionDate';
  @IsIn(['asc', 'desc']) @IsOptional() sortOrder: 'asc' | 'desc' = 'desc';
}

export class InvoiceLineItemDto {
  @ApiProperty() @IsString() description!: string;
  @ApiProperty() @IsNumber() @Min(0.01) quantity!: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() sortOrder?: number;
}

export class CreateInvoiceDto {
  @ApiProperty() @IsString() clientId!: string;
  @ApiProperty() @IsString() dueDate!: string;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() taxRate: number = 0;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() discount: number = 0;
  @ApiPropertyOptional() @IsString() @IsOptional() currency?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
  @ApiProperty({ type: [InvoiceLineItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceLineItemDto) lineItems!: InvoiceLineItemDto[];
}

export class UpdateInvoiceDto {
  @IsEnum(InvoiceStatus) @IsOptional() status?: InvoiceStatus;
  @IsString() @IsOptional() dueDate?: string;
  @IsNumber() @Min(0) @IsOptional() taxRate?: number;
  @IsNumber() @Min(0) @IsOptional() discount?: number;
  @IsString() @IsOptional() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceLineItemDto) @IsOptional() lineItems?: InvoiceLineItemDto[];
}

export class InvoiceFiltersDto {
  @IsString() @IsOptional() clientId?: string;
  @IsEnum(InvoiceStatus) @IsOptional() status?: InvoiceStatus;
  @IsString() @IsOptional() dateFrom?: string;
  @IsString() @IsOptional() dateTo?: string;
  @Type(() => Number) page: number = 1;
  @Type(() => Number) limit: number = 20;
}

export class CreateClientDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() company?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() address?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() taxId?: string;
}
