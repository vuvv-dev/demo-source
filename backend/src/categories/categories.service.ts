import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async findAll() {
    const data = await this.repo.find({ order: { createdAt: 'ASC' } });
    return { data, success: true };
  }

  async create(dto: CreateCategoryDto) {
    const cat = this.repo.create(dto);
    const data = await this.repo.save(cat);
    return { data, success: true, message: 'Tạo danh mục thành công' };
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    await this.repo.update(id, dto);
    return { data: { ...cat, ...dto }, success: true };
  }

  async remove(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Danh mục không tồn tại');
    await this.repo.delete(id);
    return { success: true, message: 'Xóa danh mục thành công' };
  }
}
