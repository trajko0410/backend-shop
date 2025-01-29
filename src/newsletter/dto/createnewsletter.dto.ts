import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsMimeType,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Attachment {
  @ApiProperty({
    description: 'Name of the file as seen by the recipient.',
    example: 'document.pdf',
  })
  @IsNotEmpty()
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'Local file path (optional).',
    example: '/uploads/document.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({
    description: 'File content as a Buffer or string (optional).',
    example: '<Buffer content>',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: Buffer | string;

  @ApiProperty({
    description: 'MIME type of the attachment (optional).',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  @IsMimeType()
  contentType?: string;
}

export class EjsFile {
  @ApiProperty({
    description: 'Name of the EJS file.',
    example: 'newsletter-template.ejs',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Buffer content of the EJS file.',
    example: '<Buffer content>',
  })
  @IsNotEmpty()
  buffer: Buffer;
}

export class SendNewsletterDto {
  @ApiProperty({
    description: 'Subject of the newsletter email.',
    example: 'Monthly Newsletter',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Plain text body of the newsletter email.',
    example: 'This is the body text of the newsletter.',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Array of EJS files for the newsletter (optional).',
    type: [EjsFile],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EjsFile)
  ejsFiles?: EjsFile[];

  @ApiProperty({
    description: 'Optional array of attachments.',
    type: [Attachment],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attachment)
  attachments?: Attachment[];
}
