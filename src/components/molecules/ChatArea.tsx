import { Post } from '.prisma/client';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ChatAreaProps {
  messages: Post[] | undefined;
}

const ChatContainer = styled.article`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 75vh;
  overflow: scroll;
`;

export default function ChatArea({ messages }: ChatAreaProps) {
  const endOfMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessageRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <ChatContainer>
      {messages?.map((message) => {
        return <p key={message.id}>{message.text}</p>;
      })}
      <div ref={endOfMessageRef} />
    </ChatContainer>
  );
}
