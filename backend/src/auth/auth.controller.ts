import { Body, Controller, Get, Inject, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { USER_REPOSITORY } from '../users/users.constants';
import { UserRepository } from '../users/domain/repositories/user.repository';
import { AuthenticatedRequest } from './guards/firebase-auth.guard';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @Get('me')
  profile(@Req() req: AuthenticatedRequest) {
    return { user: req.user ?? null };
  }

  @Patch('me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }
    const updated = await this.userRepository.update(req.user.id, {
      displayName: dto.displayName,
    });
    return { user: updated };
  }
}
