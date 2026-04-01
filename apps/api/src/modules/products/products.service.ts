import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
  }

  private readonly includeRelations = {
    category: true,
    images: {
      orderBy: {
        sortOrder: 'asc' as const
      }
    }
  };

  async create(dto: CreateProductDto) {
    await this.ensureCategoryExists(dto.categoryId);

    const { images, ...data } = dto;

    return this.prisma.product.create({
      data: {
        ...data,
        images: images?.length
          ? {
              create: images
            }
          : undefined
      },
      include: this.includeRelations
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: this.includeRelations
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.includeRelations
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const { images, ...data } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images
              }
            }
          : {})
      },
      include: this.includeRelations
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  }
}
