export default function Footer() {
  return (
    <footer className="py-8 px-8 border-t border-black/5 text-center">
      <p className="text-xs text-[--text-tertiary]">
        Built by{" "}
        <a
          href="https://www.linkedin.com/in/joshuacanter/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-[--accent-cyan] transition-colors"
        >
          The Canter Company
        </a>
      </p>
    </footer>
  );
}
