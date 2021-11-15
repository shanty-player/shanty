-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "nowPlayingVideoId" TEXT NOT NULL,
    "playTimeNow" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);
