import { IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DatabaseConfig {
    @IsString()
    username!: string;
    @IsString()
    password!: string;
}

export class ConfigData {
    @MinLength(5)
    name!: string;

    @Type(() => DatabaseConfig)
    @ValidateNested()
    db!: DatabaseConfig;

    city?: string;
}
