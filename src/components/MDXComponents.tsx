import { faCopy } from "@fortawesome/free-regular-svg-icons";
import {
  faCheck,
  faChevronDown,
  faCircleXmark,
  faInfoCircle,
  faLightbulb,
  faNoteSticky,
  faTriangleExclamation,
  faVideo,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

// headings
function createHeading(level: number) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return function Heading({ children }: { children: string }) {
    const id = children.toLowerCase().replace(/\s+/g, "-");
    return (
      <Tag id={id}>
        <a
          href={`#${id}`}
          className="heading-anchor"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            window.history.pushState(null, "", `#${id}`);
          }}
        >
          {children}
        </a>
      </Tag>
    );
  };
}

// codeblock
function CopyButton({
  preRef,
}: {
  preRef: React.RefObject<HTMLPreElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = preRef.current?.querySelector("code")?.innerText ?? "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={handleCopy}>
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
    </button>
  );
}

function CodeBlock({
  children,
  "data-language": language = "",
  ...props
}: React.ComponentProps<"pre"> & { "data-language"?: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language}</span>
        <CopyButton preRef={preRef} />
      </div>
      <pre ref={preRef} {...props}>
        {children}
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

export function BulletLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <p>
      <a href={href} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    </p>
  );
}

export function VideoEmbed({
  src,
  title = "Video",
}: {
  src: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`video-embed ${open ? "video-embed--open" : ""}`}>
      <button
        type="button"
        className="video-embed-bar"
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          <FontAwesomeIcon icon={faVideo} />
          {title}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className="video-embed-chevron" />
      </button>
      {open && (
        <div className="video-embed-body">
          <iframe
            src={src}
            title={title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  Blockquote,
  BulletLink,
  VideoEmbed,
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
  pre: CodeBlock,
};
