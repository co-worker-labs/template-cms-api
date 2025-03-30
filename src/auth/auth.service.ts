import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  UnauthorizedException,
} from '../common/exception/exception';
import { Errs } from '../common/error-codes';
import * as bcrypt from 'bcrypt';
import { cms_manager } from '@prisma/client';
import { ManagerService } from '../manager/manager.service';

@Injectable()
export class AuthService {
  constructor(private readonly managerService: ManagerService) {}

  async signIn(username: string, password: string): Promise<cms_manager> {
    const m = await this.managerService.findOneByUsername(username);
    if (!m) {
      throw new BadRequestException(Errs.INCORRECT_USERNAME_OR_PASSWORD);
    }
    const isMatch = await bcrypt.compare(password, m.password);
    if (!isMatch) {
      throw new BadRequestException(Errs.INCORRECT_USERNAME_OR_PASSWORD);
    }
    return m;
  }

  logout() {}

  findProfile(id: number) {
    const m = this.managerService.findOneVoById(id);
    if (!m) {
      throw new UnauthorizedException(Errs.UNAUTHORIZED);
    }
    return m;
  }
}
