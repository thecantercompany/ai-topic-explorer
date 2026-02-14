interface Props {
  relatedQuestions: string[];
}

export default function Perplexity({ relatedQuestions }: Props) {
  return (
    <div className="glass-tier-2 rounded-2xl p-6">
      <div className="flex flex-col gap-2.5">
        {relatedQuestions.slice(0, 15).map((question, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-sm text-[--text-secondary]"
          >
            <span className="text-purple-400 shrink-0">&rarr;</span>
            <span>{question}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
