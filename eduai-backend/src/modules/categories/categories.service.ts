import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { makeUniqueSlug, toSlug } from '../../common/slug';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const nameExists = await this.categoryRepository.findOne({
      where: { name: dto.name },
      select: { id: true },
    });
    if (nameExists) {
      throw new BadRequestException('Category name already exists');
    }

    const providedSlug = dto.slug ? toSlug(dto.slug) : '';
    const baseSlug = providedSlug || toSlug(dto.name);
    if (!baseSlug) {
      throw new BadRequestException('Slug is required');
    }

    const slug = providedSlug
      ? baseSlug
      : await makeUniqueSlug(baseSlug, async (candidate) => {
          const existing = await this.categoryRepository.findOne({
            where: { slug: candidate },
            select: { id: true },
          });
          return Boolean(existing);
        });

    if (!slug) {
      throw new BadRequestException('Slug is required');
    }

    if (providedSlug) {
      const slugExists = await this.categoryRepository.findOne({
        where: { slug },
        select: { id: true },
      });
      if (slugExists) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    const category = this.categoryRepository.create({ ...dto, slug });
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    const normalizedSlug = dto.slug ? toSlug(dto.slug) : undefined;
    if (dto.slug && !normalizedSlug) {
      throw new BadRequestException('Slug is required');
    }

    if (dto.name || dto.slug) {
      const exists = await this.categoryRepository.findOne({
        where: [
          dto.name ? { name: dto.name, id: Not(id) } : {},
          normalizedSlug ? { slug: normalizedSlug, id: Not(id) } : {},
        ],
      });

      if (exists) {
        throw new BadRequestException('Category name or slug already exists');
      }
    }

    Object.assign(category, {
      ...dto,
      ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    });
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);

    await this.categoryRepository.remove(category);

    return {
      message: 'Category deleted successfully',
    };
  }
}
