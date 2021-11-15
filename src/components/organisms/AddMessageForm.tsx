import { useSession, signIn } from 'next-auth/client';
import { trpc } from 'utils/trpc';

export default function AddMessageForm() {
  const addPost = trpc.useMutation('post.add');
  const utils = trpc.useContext();
  const [session] = useSession();

  const userName = session?.user?.name;
  if (!userName) {
    return (
      <button onClick={() => signIn()} data-testid="signin">
        Sign In to write
      </button>
    );
  }
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          /**
           * In a real app you probably don't want to use this manually
           * Checkout React Hook Form - it works great with tRPC
           * @link https://react-hook-form.com/
           */

          const $text: HTMLInputElement = (e as any).target.elements.text;
          const input = {
            text: $text.value,
          };
          try {
            await addPost.mutateAsync(input);
            $text.value = '';
          } catch {}
        }}
      >
        <fieldset disabled={addPost.isLoading}>
          <label htmlFor="name">Your name:</label>
          <br />
          <input id="name" name="name" type="text" disabled value={userName} />

          <br />
          <label htmlFor="text">Text:</label>
          <br />
          <textarea
            id="text"
            name="text"
            autoFocus
            onKeyDown={() => {
              utils.client.mutation('post.isTyping', {
                typing: true,
              });
            }}
            onBlur={() => {
              utils.client.mutation('post.isTyping', {
                typing: false,
              });
            }}
          />
          <br />
          <input type="submit" />
        </fieldset>
        {addPost.error && (
          <p style={{ color: 'red' }}>{addPost.error.message}</p>
        )}
      </form>
    </>
  );
}
