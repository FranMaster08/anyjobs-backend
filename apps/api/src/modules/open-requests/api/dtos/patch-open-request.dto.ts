import { PartialType } from '@nestjs/swagger';
import { CreateOpenRequestDto } from './create-open-request.dto';

export class PatchOpenRequestDto extends PartialType(CreateOpenRequestDto) {}
