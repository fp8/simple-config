import { IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
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

export class ExtraConfig {
    @MinLength(5)
    name!: string;

    @Type(() => DatabaseConfig)
    @ValidateNested()
    db!: DatabaseConfig;

    @IsString()
    @MinLength(5)
    extra!: string;
}

export class ConfigDataAll {
    @Type(() => ConfigData)
    @ValidateNested()
    config!: ConfigData;

    @Type(() => ExtraConfig)
    @ValidateNested()
    extraConfig!: ExtraConfig

    badConfig!: Record<string, string>

    @IsOptional()
    @IsString()
    city?: string;
}

export class JustName {
    @IsString()
    @MinLength(3)
    name!: string;
}

export class ConfigDataYaml {
    @Type(() => JustName)
    @ValidateNested()
    app!: JustName;

    @Type(() => JustName)
    @ValidateNested()
    config!: JustName

    @Type(() => JustName)
    @ValidateNested()
    extra!: JustName
}