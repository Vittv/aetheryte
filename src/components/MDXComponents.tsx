import {
  faCheck,
  faCircleXmark,
  faCopy,
  faInfoCircle,
  faLightbulb,
  faNoteSticky,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { useState } from "react";

// headings
function createHeading(level: number) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return function Heading({ children }: { children: string }) {
    const id = children.toLowerCase().replace(/\s+/g, "-");
    return (
      <Tag id={id}>
        <a href={`#${id}`}>{children}</a>
      </Tag>
    );
  };
}

// codeblock
export function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language}</span>
        <button type="button" onClick={handleCopy}>
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
        </button>
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

// blockquote
type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

const CALLOUT_CONFIG: Record<
  CalloutType,
  { icon: IconDefinition; label: string }
> = {
  note: { icon: faInfoCircle, label: "Note" },
  tip: { icon: faLightbulb, label: "Tip" },
  important: { icon: faNoteSticky, label: "Important" },
  warning: { icon: faTriangleExclamation, label: "Warning" },
  caution: { icon: faCircleXmark, label: "Caution" },
};

export function Blockquote({
  type = "note",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const { icon, label } = CALLOUT_CONFIG[type];
  return (
    <div className={`blockquote blockquote--${type}`}>
      <div className="blockquote-header">
        <FontAwesomeIcon icon={icon} className="blockquote-icon" />
        <span>{label}</span>
      </div>
      <div className="blockquote-body">{children}</div>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  Blockquote,
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
  pre: ({ children }) => <>{children}</>,
  code: ({ children, className }) => (
    <CodeBlock className={className}>{children as string}</CodeBlock>
  ),
};
