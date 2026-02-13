const platforms = [
  {
    name: "Claude",
    provider: "Anthropic",
    description: "Known for nuanced analysis and careful reasoning.",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "GPT",
    provider: "OpenAI",
    description: "Broad knowledge base with strong general coverage.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Gemini",
    provider: "Google",
    description: "Deep integration with Google's knowledge graph.",
    color: "bg-blue-100 text-blue-700",
  },
];

const steps = [
  {
    number: "1",
    title: "Enter a topic",
    description: "Type any subject you want to explore.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "AI models analyze it",
    description:
      "We query multiple AI models simultaneously and combine their responses.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "See what AI knows",
    description:
      "Get a word cloud of key terms, named entities with links, and AI-suggested sources.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Word Cloud",
    description:
      "See the most frequently mentioned terms across all AI responses at a glance.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    title: "Named Entities",
    description:
      "People, organizations, locations, and concepts identified by AI — each linked for easy research.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    title: "Citations",
    description:
      "Sources and references suggested by the AI models, with links to learn more.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

export default function MethodologySection() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-20 px-4">
      {/* How It Works */}
      <h2 className="text-2xl font-bold text-green-900 text-center mb-8">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
              {step.icon}
            </div>
            <h3 className="font-semibold text-green-900 mb-2">{step.title}</h3>
            <p className="text-sm text-green-700">{step.description}</p>
          </div>
        ))}
      </div>

      {/* What You Get */}
      <h2 className="text-2xl font-bold text-green-900 text-center mb-8">
        What You Get
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-green-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-green-700">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Platforms */}
      <h2 className="text-2xl font-bold text-green-900 text-center mb-8">
        Powered By
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center"
          >
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${platform.color}`}
            >
              {platform.name}
            </span>
            <p className="text-xs text-green-500 mb-2">{platform.provider}</p>
            <p className="text-sm text-green-700">{platform.description}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-green-500 text-center max-w-2xl mx-auto">
        AI responses may contain inaccuracies. Citations and links are
        AI-suggested and may not be valid. This tool shows what AI models report
        — it does not verify facts.
      </p>
    </section>
  );
}
