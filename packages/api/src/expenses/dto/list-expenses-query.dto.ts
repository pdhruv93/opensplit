import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListExpensesQueryDto {
  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  friend_id?: string;

  @IsOptional()
  @IsDateString()
  dated_after?: string;

  @IsOptional()
  @IsDateString()
  dated_before?: string;

  @IsOptional()
  @IsDateString()
  updated_after?: string;

  @IsOptional()
  @IsDateString()
  updated_before?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
