import styled from 'styled-components';
import { YoutubeItemData } from 'types/YoutubeItemData';

interface VideoListProps {
  videoList: YoutubeItemData[];
  onClickVideo: (videoId: string) => void;
}

const VideoContainer = styled.article`
  display: flex;
  flex-direction: column;
  overflow: scroll;
  max-height: 70vh;
`;

export default function VideoList({ videoList, onClickVideo }: VideoListProps) {
  const playVideoById = (videoId: string) => {
    onClickVideo(videoId);
  };

  return (
    <VideoContainer>
      {videoList.map((video) => {
        return (
          <div
            key={video.id.videoId}
            onClick={() => playVideoById(video.id.videoId)}
          >
            <img src={video.snippet.thumbnails.default.url} />
            <p>{video.snippet.title}</p>
          </div>
        );
      })}
    </VideoContainer>
  );
}
