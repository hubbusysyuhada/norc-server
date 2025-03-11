import { Entity, PrimaryKey, Enum, Property, OneToMany, Collection } from '@mikro-orm/core'
import { v4 } from 'uuid'
import Log from './Log';

export enum JobTypes {
    javascript = 'javascript'
}

@Entity({ tableName: "jobs" })
export default class Job {
    @PrimaryKey({ type: "uuid" })
    id = v4();

    @Property()
    name!: string;

    @Property()
    description: string;

    @Property({ length: 50 })
    pattern!: string;

    @Property({ columnType: "text" })
    definition: string; // the default should be "async function main() {\\n  // write your code here\\n}"

    @Enum(() => JobTypes)
    type = JobTypes.javascript

    @Property()
    isActive = true;

    @Property({ type: 'timestamp with timezone' })
    createdAt: Date = new Date();

    @OneToMany(() => Log, e => e.job)
    logs = new Collection<Log>(this)
}