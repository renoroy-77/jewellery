import { PartialType } from '@nestjs/swagger';
import { CreateDevoteeUserDto } from './create-user.dto';

export class UpdateDevoteeUserDto extends PartialType(CreateDevoteeUserDto) {}
