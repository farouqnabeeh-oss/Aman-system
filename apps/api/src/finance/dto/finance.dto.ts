import {
  IsString, IsEnum, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionStatus, InvoiceStatus, Department, PaymentMethod } from '@ems/shared';

export class CreateTransactionDto {
   type!: TransactionType;
   amount!: number;
   currency?: string;
   description!: string;
   category!: string;
   department?: Department;
   reference?: string;
   paymentMethod?: PaymentMethod;
   invoiceId?: string;
   transactionDate?: string;
}

export class TransactionFiltersDto {
  @IsEnum(TransactionType) @IsOptional() type?: TransactionType;
  @IsEnum(TransactionStatus) @IsOptional() status?: TransactionStatus;
  @IsString() @IsOptional() department?: string;
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
   description!: string;
   quantity!: number;
   unitPrice!: number;
   sortOrder?: number;
}

export class CreateInvoiceDto {
   clientId!: string;
   dueDate!: string;
   taxRate: number = 0;
   discount: number = 0;
   currency?: string;
   notes?: string;
   @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceLineItemDto) lineItems!: InvoiceLineItemDto[];
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
   name!: string;
   email?: string;
   phone?: string;
   company?: string;
   address?: string;
   taxId?: string;
}
