import { Controller, Get, Req, Param, Query, Post, Body } from '@nestjs/common';
import { Card } from './card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, LessThan } from 'typeorm';
import { generateLevels } from '../helpers/ishobin';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

type Query = {
  keyword?: string;
  showCount: number;
  lastId?: number;
};

type AddItem = {
  word: string;
  context?: string;
  picture?: string;
  explain: string;
  tag?: string;
};

const grade = generateLevels(15);

@Controller('api')
export class CardController {
  constructor(@InjectRepository(Card) private cardStore: Repository<Card>) {}

  @Get('card/list')
  async getList(
    @Query() query: Query,
  ): Promise<{ list: Card[]; query: Query }> {
    console.log('query', query);

    const where: any = {};
    if ('keyword' in query) {
      where.word = Like(`%${query.keyword}%`);
    }
    if ('lastId' in query) {
      where.id = LessThan(query.lastId);
    }
    const list = await this.cardStore.find({
      where,
      take: query.showCount,
      order: {
        id: 'DESC',
      },
    });

    return {
      list,
      query,
    };
  }

  @Post('card/add')
  async addItem(@Body() body: AddItem): Promise<string> {
    console.log('body', body);

    await this.cardStore.create({
      word: body.word,
      context: body.context,
      picture: body.picture,
      explain: body.explain,
      tag: body.tag,
      createAt: new Date(),
      updateAt: new Date(),
      nextReadAt: new Date(),
    });

    return 'OK';
  }

  @Get('review/list')
  async getReviewList(@Query() query: { showCount: number }): Promise<Card[]> {
    // 按复习时间取前50个单词 随机打乱
    const list = await this.cardStore.find({
      where: {
        status: 1,
        nextReadAt: LessThan(new Date()),
      },
      take: 30,
      order: {
        nextReadAt: 'ASC',
      },
    });
    return randomList(list).slice(query.showCount);
  }

  @Post('review/update')
  async updateCardStatus(
    @Body() body: { list: { status?: 0 | 1; level?: number; id: number }[] },
  ): Promise<string> {
    const next = body.list.map(item => {
      const ql: any = { id: item.id };
      if ('status' in item) {
        ql.status = item.status;
      }
      if ('level' in item) {
        ql.lastReadAt = new Date();
        ql.nextReadAt = new Date(Date.now() + grade[item.level] * 60e3);
      }
      ql.updateAt = new Date();
      return ql;
    });

    await this.cardStore.save(next);

    return 'OK';
  }

  @Get('review/next_time')
  async getNextTime(): Promise<{ count: number; nextTime?: string }> {
    const list = await this.cardStore.find({
      order: {
        nextReadAt: 'ASC',
      },
    });

    const first = list[0];
    if (!first)
      return {
        count: 0,
      };

    if (first.nextReadAt.getTime() > Date.now()) {
      return {
        count: 0,
        nextTime: first.nextReadAt.toString(),
      };
    }

    const current = Date.now();
    const filter = list.filter(item => item.nextReadAt.getTime() < current);
    return {
      count: filter.length,
    };
  }

  @Get('import')
  async importCsv() {
    // @ts-ignore
    const json = readFileSync(resolve('data/card.json'), 'utf8');
    const list = JSON.parse(json);
    const cards: Card[] = list.map(item => {
      const lastRead =
        !item.lastRead || item.lastRead.length < 10
          ? Date.now()
          : new Date(item.lastRead).getTime();
      const readLevel = isNaN(item.readLevel) ? 0 : +item.readLevel;
      const created =
        !item.created || item.created.length < 10 ? Date.now() : item.created;
      const updated =
        !item.lastModified ||
        item.lastModified.length < 10 ||
        item.lastModified.length > 30
          ? created
          : item.lastModified;
      const s = {
        word: item.front,
        explain: item.back,
        picture: item.picture,
        createAt: new Date(created),
        updateAt: new Date(updated),
        readLevel,
        lastReadAt: new Date(lastRead),
        nextReadAt: new Date(lastRead + grade[readLevel] * 60e3),
      } as Card;
      console.log(created, updated);
      return s;
    });
    await this.cardStore.save(cards);
    return 'OK';
  }
}

function randomList(list: any[]) {
  const _list = list.slice();
  let next = [];

  while (_list.length > 0) {
    const n = Math.floor(Math.random() * _list.length);
    next = next.concat(_list.splice(n, 1));
  }
  return next;
}
