import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SaveManagerDto } from './dto/save-manager.dto';
import { hashSync } from 'bcrypt';
import { PrismaErrorCodes } from '../common/prisma/error-code.enum';
import {
  BadRequestException,
  InvalidParameterException,
} from '../common/exception/exception';
import { Errs } from '../common/error-codes';
import { getPageResult, PageQuery } from '../common/pagination';
import { ManagerVO, toManagerVO } from './vo/manager.vo';
import { cms_manager } from '@prisma/client';
import { Role } from '../auth/role.enum';

const saltOrRounds = 10;

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  findOneByUsername(username: string) {
    return this.prisma.cms_manager.findUnique({
      where: {
        username,
      },
    });
  }

  async save(input: SaveManagerDto) {
    const hash_password = hashSync(input.password, saltOrRounds);
    await this.prisma.cms_manager
      .create({
        data: {
          username: input.username,
          password: hash_password,
          role: input.role || Role.User,
        },
      })
      .catch((e) => {
        if (e.code === PrismaErrorCodes.UniqueConstraintViolation) {
          throw new BadRequestException(Errs.DUPLICATED);
        }
        throw e;
      });
  }

  async deleteById(id: number) {
    await this.prisma.cms_manager.delete({ where: { id } }).catch((e) => {
      if (e.code === PrismaErrorCodes.NotFound) {
        throw new InvalidParameterException('id');
      }
      throw e;
    });
  }

  async findPage(pageQuery: PageQuery) {
    const [total, list] = await Promise.all([
      this.prisma.cms_manager.count({}),
      this.prisma.cms_manager.findMany({
        orderBy: {
          username: 'asc',
        },
        select: {
          id: true,
          username: true,
          role: true,
          created_at: true,
        },
        skip: pageQuery.getSkip(),
        take: pageQuery.getTake(),
      }),
    ]);
    return getPageResult<ManagerVO>(
      pageQuery,
      total,
      list?.map((it) => toManagerVO(it as cms_manager)),
    );
  }

  async findOneById(id: number) {
    return this.prisma.cms_manager.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneVoById(id: number) {
    return this.findOneById(id).then(toManagerVO);
  }

  async changePassword(id: number, new_password: string) {
    const hash_password = hashSync(new_password, saltOrRounds);
    await this.prisma.cms_manager
      .update({
        where: {
          id,
        },
        data: {
          password: hash_password,
        },
      })
      .catch((e) => {
        if (e.code === PrismaErrorCodes.NotFound) {
          throw new InvalidParameterException('id');
        }
        throw e;
      });
  }

  async changeRole(id: number, role: number) {
    await this.prisma.cms_manager
      .update({
        where: {
          id,
        },
        data: {
          role,
        },
      })
      .catch((e) => {
        if (e.code === PrismaErrorCodes.NotFound) {
          throw new InvalidParameterException('id');
        }
        throw e;
      });
  }
}
