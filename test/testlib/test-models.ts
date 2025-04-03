import {
    IsOptional, MinLength,
    IsAlpha, IsString, 
    ValidateNested,
    IsBase64,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IEntityCreator } from '@fp8proj';


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

export class JustNameWithTestEntry extends JustName {
    @IsString()
    @MinLength(3)
    fp8TestVal!: string;
}

export class JustNameWithEntry extends JustName {
    @IsString()
    @MinLength(3)
    entry!: string;
}

export class ConfigDataYaml {
    @Type(() => JustNameWithTestEntry)
    @ValidateNested()
    app!: JustNameWithTestEntry;

    @Type(() => JustName)
    @ValidateNested()
    config!: JustName

    @Type(() => JustNameWithEntry)
    @ValidateNested()
    extra!: JustNameWithEntry
}

export class BadConfigData {
    @IsAlpha()
    @MinLength(5)
    name!: string;

    @MinLength(20)
    @IsBase64()
    key64!: string;

    @Type(() => ExtraConfig)
    @ValidateNested()
    @IsNotEmpty()
    extra!: ExtraConfig;

    @Type(() => DatabaseConfig)
    @ValidateNested()
    db!: DatabaseConfig;

    @IsString()
    city!: string;
}

export class ConfigDataWithPost implements IEntityCreator {
    #id: string | undefined;

    @IsString()
    name!: string;
    
    get id(): string {
        if (this.#id === undefined) throw new Error('id not set');
        return this.#id;
    }

    _postCreateProcessing(): void {
        this.#id = `id.${this.name}`
    }
}
