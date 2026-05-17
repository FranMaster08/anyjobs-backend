import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({ example: 2 })
  count!: number;
}
