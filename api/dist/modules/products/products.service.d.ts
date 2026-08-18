import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    create(createProductDto: CreateProductDto): string;
    findAll(): string;
    findOne(id: number): string;
    remove(id: number): string;
}
