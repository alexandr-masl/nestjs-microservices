import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {

  /**
   * Transforms and validates incoming request data.
   * 
   * @param value - The value to be transformed and validated.
   * @param metatype - Metadata about the value, including its expected type.
   * @returns The validated and transformed value.
   * @throws BadRequestException if validation fails.
   */
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Skip validation if no metadata type is provided or if the type doesn't require validation.
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Convert the plain JavaScript object to an instance of the specified class.
    const object = plainToInstance(metatype, value);

    // Validate the object using class-validator.
    const errors = await validate(object);

    // If there are validation errors, throw a BadRequestException with a relevant message.
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    // If validation is successful, return the validated value.
    return value;
  }

  /**
   * Determines whether the given metatype requires validation.
   * 
   * @param metatype - The metatype (constructor) of the value being validated.
   * @returns A boolean indicating whether the type should be validated.
   */
  private toValidate(metatype: Function): boolean {
    // Types that don't need validation
    const types: Function[] = [String, Boolean, Number, Array, Object];
    
    // If the type is one of the common JavaScript types, skip validation.
    return !types.includes(metatype);
  }
}
