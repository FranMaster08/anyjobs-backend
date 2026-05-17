import { ApiProperty } from '@nestjs/swagger';

export class MarkAllReadResponseDto {
  @ApiProperty({ example: 3 })
  updated!: number;
}
