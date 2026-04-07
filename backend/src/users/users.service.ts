import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.userRepo.findAndCount({
      select: ['id','email','name','phone','role','avatar','createdAt'],
      skip: (page - 1) * limit, take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id }, select: ['id','email','name','phone','address','role','avatar','createdAt'] });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return { data: user, success: true };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }
}
