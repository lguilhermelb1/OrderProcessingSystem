import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from "class-validator";

export class OrderDto {
    @ApiProperty({
        description: 'The ID of the product being ordered',
        example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    })
    @IsUUID('4', { message: 'productId must be a valid UUID v4' })
    @IsNotEmpty({ message: 'productId should not be empty' })
    productId!: string;

    @ApiProperty({
        description: 'The quantity of the product being ordered',
        example: 2,
        minimum: 1,
    })
    @IsInt({ message: 'The quantity must be an integer' })
    @IsPositive({ message: 'The quantity must be a positive number' })
    quantity!: number;
}
