import cron from 'node-cron'
import { fork } from 'child_process'
import path from 'path'
import fs from 'fs'


import { CronJob, CronCommand, job } from 'cron'
import Job, { JobTypes } from './database/entity/Job';
import MikroOrmInstance from './database';

import axios from 'axios';
import lodash from 'lodash'
import { MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql';
import Log from './database/entity/Log';

export type SchedulerContext = {
  env: Record<string, string>;
  packages: Record<string, any>;
}

export type LogsType = { type: 'log' | 'error', val: string }[]

export default class Scheduler {
  private ctx: SchedulerContext = { env: {}, packages: {} }
  private runningJobs: { [key: string]: { pattern: string, definition: string, isActive: boolean, job: cron.ScheduledTask } } = {}
  private jobLogs: {[key: string]: LogsType} = {}

  constructor (private em: SqlEntityManager<MySqlDriver>) {}

  public registerJob(job: Job) {
      const { name, definition, pattern } = job
      const child = fork(path.join(__dirname, 'jobWrapper.ts'), [job.name]);
      child.on('message', (message: {type: "log" | "error"; data: string}) => {
        const { type, data: val } = message
        if (!this.jobLogs[job.id]) this.jobLogs[job.id] = []
        this.jobLogs[job.id].push({ type, val });
      });
    
      child.on('close', (code) => {
        if (code !== 0) {
          // should retry job if premium
          // const restartMessage = `restarting job in 60 seconds.`;
          // setTimeout(() => spawnJob(jobDefinition), 60000); // Restart after 60 seconds
        }
        this.saveLog(job)
      });
      child.send({ type: 'jobFunction', functionString: definition, ctx: { 
        env: { name: "hehehehe" },
        package: {
          lodash,
          axios
        }
      } });
  }

  private async saveLog(job: Job) {
    const log = new Log()
    log.events = this.jobLogs[job.id]
    log.job = job
    log.isError = !!(this.jobLogs[job.id].find(l => l.type === 'error'))
    this.jobLogs[job.id] = []
    await this.em.persistAndFlush(log)
  }

  public stop(id: string) {
    this.runningJobs[id].job.stop()
    delete this.runningJobs[id]
  }

  private async initEnv() {
    const data = { PWD: process.env.PWD }
    this.ctx.env = data
  }

  private async initPackages() {
    this.ctx.packages = {
      axios,
      lodash,
    }
  }

  private async initCtx() {
    await this.initEnv()
    await this.initPackages()
  }

  public addEnv(key: string, value: string) {
    this.ctx.env[key] = value;
  }

  static async init(orm: MikroOrmInstance) {
    const em = await orm.getEm()
    const scheduler = new Scheduler(em)
    await scheduler.initCtx()
    const data = await em.find(Job, { type: JobTypes.javascript, isActive: true })
    data.forEach(job => {
      const { definition, isActive, pattern } = job
      const cronJob = cron.schedule(job.pattern, () => scheduler.registerJob(job));
      scheduler.runningJobs[job.id] = { definition, isActive, pattern, job: cronJob }
    })
    console.log(data.length, "job(s) successfully registered");
    return scheduler
  }
}