interface Props {
  relatedQuestions: string[];
}

export default function Perplexity({ relatedQuestions }: Props) {
  return (
    <div className="rounded-2xl border-l-4 border-purple-400 bg-purple-50/40 backdrop-blur-sm p-6">
      <h3 className="font-semibold text-purple-700 mb-1">Perplexity</h3>
      <p className="text-xs text-[--text-tertiary] mb-4">
        Perplexity searched the web in real time for this topic. Here are
        related questions it suggested for further exploration.
      </p>

      <div className="border-t border-purple-200/50 pt-4">
        <div className="flex flex-col gap-2.5">
          {relatedQuestions.map((question, i) => (
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
    </div>
  );
}
