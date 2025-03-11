import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 } from 'uuid'
import Job from './Job';
import { LogsType } from '../../scheduler';

export enum JobTypes {
    javascript = 'javascript'
}

@Entity({ tableName: "logs" })
export default class Log {
    @PrimaryKey({ type: "uuid" })
    id = v4();

    @ManyToOne({ onDelete: "CASCADE", onUpdateIntegrity: "CASCADE" })
    job!: Job;

    @Property({ type: 'json', nullable: true })
    events: LogsType = []

    @Property()
    isError = false

    @Property({ type: 'timestamp with timezone' })
    createdAt: Date = new Date();
}