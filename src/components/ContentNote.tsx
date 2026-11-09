export function ContentNote({ text }: { text: string }) {
  return (
    <aside className="content-note" aria-label="Content note">
      <p>
        <strong>Content note:</strong> {text}
      </p>
    </aside>
  );
}
