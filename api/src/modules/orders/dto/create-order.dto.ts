import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { OrderDto } from "./order.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {
    @ApiProperty({
        description: 'The email address of the customer placing the order',
        example: 'customer@example.com'
    })
    @IsEmail({}, { message: 'customerEmail must be a valid email address' })
    @IsNotEmpty({ message: 'customerEmail should not be empty' })
    customerEmail!: string;

    @ApiProperty({
        description: 'A unique key for idempotent order creation',
        example: 'idempotency-key-123'
    })
    @IsString()
    @IsNotEmpty({ message: 'idempotencyKey should not be empty' })
    idempotencyKey!: string;

    @ApiProperty({
        description: 'The list of items in the order',
        type: [OrderDto]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'items must contain at least one item' })
    @ValidateNested({ each: true })
    @Type(() => OrderDto)
    items!: OrderDto[];
}
