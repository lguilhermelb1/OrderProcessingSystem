import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({message: 'Product name is required'})
    name!: string;

    @IsNumber()
    @IsPositive({message: 'Product price must be greater than zero'})
    price!: number;

    @IsNumber()
    @Min(0, {message: 'Product stock must be zero or greater'})
    stock_quantity!: number;
}
