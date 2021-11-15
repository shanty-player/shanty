/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */

import { z } from 'zod';
import { createRouter } from '../createRouter';
import { EventEmitter } from 'events';
import { Subscription } from '@trpc/server';
import { Player, PrismaClient } from '@prisma/client';

interface PlayerEvents {
  nowPlayingUpdate: (videoId: Player) => void;
}
declare interface PlayerEventEmitter {
  on<U extends keyof PlayerEvents>(event: U, listener: PlayerEvents[U]): this;
  once<U extends keyof PlayerEvents>(event: U, listener: PlayerEvents[U]): this;
  emit<U extends keyof PlayerEvents>(
    event: U,
    ...args: Parameters<PlayerEvents[U]>
  ): boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PlayerEventEmitter extends EventEmitter {}

const ee = new PlayerEventEmitter();
const prisma = new PrismaClient();

export const playerRouter = createRouter()
  // create
  .mutation('setNowPlaying', {
    input: z.object({
      id: z.string().uuid().optional(),
      nowPlayingVideoId: z.string().min(1),
    }),

    async resolve({ ctx, input }) {
      const player = await ctx.prisma.player.create({
        data: {
          ...input,
          playTimeNow: 0,
        },
      });

      ee.emit('nowPlayingUpdate', player);
      return player;
    },
  })
  .query('infinite', {
    input: z.object({
      cursor: z.date().nullish(),
      take: z.number().min(1).max(50).nullish(),
    }),
    async resolve({ input, ctx }) {
      const take = input.take ?? 10;
      const cursor = input.cursor;
      // `cursor` is of type `Date | undefined`
      // `take` is of type `number | undefined`
      const page = await ctx.prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursor
          ? {
              createdAt: cursor,
            }
          : undefined,
        take: take + 1,
        skip: 0,
      });
      const items = page.reverse();
      let prevCursor: null | typeof cursor = null;
      if (items.length > take) {
        const prev = items.shift();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        prevCursor = prev!.createdAt;
      }
      return {
        items,
        prevCursor,
      };
    },
  })
  .subscription('nowPlaying', {
    resolve() {
      return new Subscription<Player>(async (emit) => {
        const onNowPlayingUpdate = (data: Player) => {
          emit.data(data);
        };

        const nowPlaying = await prisma.player.findFirst({
          orderBy: { startPlayAt: 'desc' },
        });
        if (nowPlaying !== null) onNowPlayingUpdate(nowPlaying);

        ee.on('nowPlayingUpdate', onNowPlayingUpdate);
        return () => {
          ee.off('nowPlayingUpdate', onNowPlayingUpdate);
        };
      });
    },
  });
