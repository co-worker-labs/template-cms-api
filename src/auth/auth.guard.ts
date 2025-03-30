import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../common/exception/exception';
import { Errs } from '../common/error-codes';
import { Reflector } from '@nestjs/core';
import { ALLOW_ANON_KEY } from './allow_anon.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowAnon = this.reflector.getAllAndOverride<number>(ALLOW_ANON_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowAnon) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    request.user = request.session.user;
    if (!request.user) {
      throw new UnauthorizedException(Errs.UNAUTHORIZED);
    }
    return true;
  }
}
