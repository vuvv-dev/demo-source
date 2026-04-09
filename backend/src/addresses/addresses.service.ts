import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepo: Repository<Address>,
  ) {}

  async findAll(userId: string) {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepo.findOne({ where: { id, user: { id: userId } } });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    }

    const address = this.addressRepo.create({
      ...dto,
      user: { id: userId } as any,
    });
    
    // If it's the first address, make it default
    const count = await this.addressRepo.count({ where: { user: { id: userId } } });
    if (count === 0) address.isDefault = true;

    return this.addressRepo.save(address);
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);
    
    if (dto.isDefault) {
      await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepo.remove(address);
    return { success: true };
  }

  async setDefault(id: string, userId: string) {
    await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    const address = await this.findOne(id, userId);
    address.isDefault = true;
    return this.addressRepo.save(address);
  }
}
