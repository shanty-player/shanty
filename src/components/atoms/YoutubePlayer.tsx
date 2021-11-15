import dayjs from 'dayjs';
import { useMemo } from 'react';
import Youtube, { Options } from 'react-youtube';
import styled from 'styled-components';

const YoutubePlayerContainer = styled.div`
  flex: 1;
`;

interface YoutubePlayerProps {
  videoId: string;
  startPlayAt: Date;
}

export default function YoutubePlayer({
  videoId,
  startPlayAt,
}: YoutubePlayerProps) {
  const options: Options = useMemo<Options>(() => {
    return {
      width: '100%',
      height: '800px',
      playerVars: {
        autoplay: 1,
        disablekb: 1,
        controls: 0,
        start: dayjs().unix() - dayjs(startPlayAt).unix(),
      },
    };
  }, [startPlayAt]);

  return (
    <YoutubePlayerContainer>
      <Youtube videoId={videoId} opts={options} />
    </YoutubePlayerContainer>
  );
}
