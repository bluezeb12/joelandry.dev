interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function TerminalWindow({
  title,
  children,
  className = "",
}: TerminalWindowProps) {
  return (
    <div className={`terminal-window animate-fade-in-up ${className}`}>
      <div className="terminal-title-bar">
        <div className="terminal-dots">
          <span className="terminal-dot terminal-dot--close" />
          <span className="terminal-dot terminal-dot--minimize" />
          <span className="terminal-dot terminal-dot--maximize" />
        </div>
        {title && <span className="terminal-title">{title}</span>}
      </div>
      <div className="terminal-body">{children}</div>
    </div>
  );
}
