import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { SaveManagerDto } from './dto/save-manager.dto';
import { PageQuery, PageQueryParam, PageResult } from '../common/pagination';
import { ManagerVO } from './vo/manager.vo';
import { ChangePasswordManagerDto } from './dto/change-password-manager.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { LoginUser } from '../auth/login-user';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Roles(Role.SuperAdmin)
@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post('')
  saveManager(@Body() input: SaveManagerDto) {
    return this.managerService.save(input);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.managerService.deleteById(id);
  }

  @Get('')
  findAll(
    @PageQueryParam() pageQuery: PageQuery,
  ): Promise<PageResult<ManagerVO>> {
    return this.managerService.findPage(pageQuery);
  }

  @Put(':id/passwd')
  changeUserPassword(
    @Param('id') id: number,
    @Body() input: ChangePasswordManagerDto,
  ) {
    return this.managerService.changePassword(id, input.password.trim());
  }

  @Put(':id/role')
  changeRole(@Param('id') id: number, @Query('role') role: number) {
    return this.managerService.changeRole(id, role);
  }

  @Roles(Role.User)
  @Put('passwd')
  changePassword(
    @CurrentUser() user: LoginUser,
    @Body() input: ChangePasswordManagerDto,
  ) {
    return this.managerService.changePassword(user.id, input.password.trim());
  }
}
