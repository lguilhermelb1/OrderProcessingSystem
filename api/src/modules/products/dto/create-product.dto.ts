import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        example: 'Wireless Mouse',
    })
    @IsString()
    @IsNotEmpty({message: 'Product name is required'})
    name!: string;

    @ApiProperty({
        description: 'The price of the product',
        example: 29.99,
    })
    @IsNumber()
    @IsPositive({message: 'Product price must be greater than zero'})
    price!: number;

    @ApiProperty({
        description: 'The quantity of the product in stock',
        example: 100,
        minimum: 0,
    })
    @IsNumber()
    @Min(0, {message: 'Product stock must be zero or greater'})
    stock_quantity!: number;
}
