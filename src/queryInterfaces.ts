export interface IFields {
    fields(fields: string[]): object;
}

export interface ILimit {
    limit(limit: number): object;
}

export interface IOffset {
    offset(offset: number): object;
}

export interface IFilter {
    offset(offset: number): object;
}

export interface IExecute {
    execute(): Promise<any>;
}
