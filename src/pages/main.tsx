import { Player, Post } from '@prisma/client';
import axios from 'axios';
import {
  AddMessageForm,
  ChatArea,
  SearchBar,
  SideBar,
  VideoList,
} from 'components';
import YoutubePlayer from 'components/atoms/YoutubePlayer';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { YoutubeItemData } from 'types/YoutubeItemData';
import { trpc } from 'utils/trpc';

const MainContainer = styled.div`
  display: flex;
  position: relative;
  width: 100vw;
  height: 100vh;
`;

export default function Main() {
  const postsQuery = trpc.useInfiniteQuery(['post.infinite', {}], {
    getPreviousPageParam: (d) => d.prevCursor,
  });
  const setNowPlaying = trpc.useMutation('player.setNowPlaying');
  const utils = trpc.useContext();

  // list of messages that are rendered
  const [messages, setMessages] = useState(() => {
    const msgs = postsQuery.data?.pages.map((page) => page.items).flat();
    return msgs;
  });
  const [searchedVideoList, setSearchedVideoList] = useState<YoutubeItemData[]>(
    [],
  );
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<Player>();

  // fn to add and dedupe new messages onto state
  const addMessages = useCallback((incoming?: Post[]) => {
    setMessages((current) => {
      const map: Record<Post['id'], Post> = {};
      for (const msg of current ?? []) {
        map[msg.id] = msg;
      }
      for (const msg of incoming ?? []) {
        map[msg.id] = msg;
      }
      return Object.values(map).sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    });
  }, []);

  const handleVideoSearch = async (query: string) => {
    try {
      const result = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&key=${process.env.YOUTUBE_API_KEY}&q=${query}`,
      );
      console.log(result);
      setSearchedVideoList([...result.data.items]);
    } catch (error) {
      console.log(`onVideoSearchErr: ${error}`);
    }
  };

  const playingVideoById = (videoId: string) => {
    try {
      setNowPlaying.mutateAsync({ nowPlayingVideoId: videoId });
    } catch {}
  };

  // when new data from `useInfiniteQuery`, merge with current state
  useEffect(() => {
    const msgs = postsQuery.data?.pages.map((page) => page.items).flat();
    addMessages(msgs);
  }, [postsQuery.data?.pages, addMessages]);

  // subscribe to new posts and add
  trpc.useSubscription(['post.onAdd'], {
    onNext(post) {
      addMessages([post]);
    },
    onError(err) {
      console.error('Subscription error:', err);
      // we might have missed a message - invalidate cache
      utils.queryClient.invalidateQueries();
    },
  });

  const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);
  trpc.useSubscription(['post.whoIsTyping'], {
    onNext(data) {
      setCurrentlyTyping(data);
    },
  });

  trpc.useSubscription(['player.nowPlaying'], {
    onNext(data) {
      setCurrentPlayingVideo(data);
    },
  });

  return (
    <MainContainer>
      <SideBar>
        <SearchBar onSearch={(query) => handleVideoSearch(query)} />
        <VideoList
          videoList={searchedVideoList}
          onClickVideo={(videoId: string) => playingVideoById(videoId)}
        />
      </SideBar>
      {currentPlayingVideo && (
        <YoutubePlayer
          videoId={currentPlayingVideo.nowPlayingVideoId}
          startPlayAt={currentPlayingVideo.startPlayAt}
        />
      )}
      <SideBar>
        <ChatArea messages={messages} />
        <AddMessageForm />
      </SideBar>
    </MainContainer>
  );
}
