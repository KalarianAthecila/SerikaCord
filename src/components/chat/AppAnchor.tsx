"use client";

import { useEffect, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { parseAppLink, type AppLink } from "@/lib/chat/appLinks";
import { navigateToMessage } from "@/lib/notifications/events";
import { ensureTarget, peekTarget, subscribeTargets, targetKey } from "@/components/chat/messageLinkPreview";

function subscribeHost(): () => void {
  return () => {};
}

/** `undefined` on the server so the first client render matches the HTML. */
function serverHost(): undefined {
  return undefined;
}

function clientHost(): string {
  return window.location.host;
}

/** This page's host, after hydration. Public app hosts don't need it. */
export function useAppHost(): string | undefined {
  return useSyncExternalStore(subscribeHost, clientHost, serverHost);
}

function isPlainClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

function go(router: ReturnType<typeof useRouter>, link: AppLink, href: string) {
  if (link.kind === "message" || /[?&]jump=/.test(href)) navigateToMessage((url) => router.push(url), href);
  else router.push(href);
}

function ExternalAnchor({
  href,
  className,
  title,
  rel,
  children,
  externalMark,
}: {
  href: string;
  className?: string;
  title?: string;
  rel?: string;
  children: ReactNode;
  externalMark?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={rel ?? "noopener noreferrer"}
      className={className}
      title={title}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {externalMark}
    </a>
  );
}

function InAppAnchor({
  link,
  className,
  title,
  children,
}: {
  link: AppLink;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <a
      href={link.href}
      className={className}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlainClick(e)) return;
        e.preventDefault();
        go(router, link, link.href);
      }}
    >
      {children}
    </a>
  );
}

function ResolvingAnchor({
  link,
  className,
  title,
  children,
}: {
  link: AppLink & { dmChannelId: string };
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const viewerId = user?.id ?? null;
  const messageId = link.kind === "message" ? link.messageId : null;
  const key = targetKey(link.dmChannelId, messageId, viewerId);
  const resolved = useSyncExternalStore(subscribeTargets, () => peekTarget(key), () => null);

  useEffect(() => {
    if (isLoading) return;
    void ensureTarget(link.dmChannelId, messageId, viewerId);
  }, [isLoading, link.dmChannelId, messageId, viewerId]);

  const href = resolved || link.href;
  return (
    <a
      href={href}
      className={className}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPlainClick(e)) return;
        e.preventDefault();
        void (async () => {
          const target = resolved || (await ensureTarget(link.dmChannelId, messageId, viewerId)) || link.href;
          go(router, link, target);
        })();
      }}
    >
      {children}
    </a>
  );
}

/**
 * A chat link. Same-host channel, DM, message and invite links stay in the
 * app (a message link jumps even when that conversation is already open).
 * Anything else opens in a new tab. Modifier-clicks and middle-click keep
 * the browser's new-tab behavior.
 */
export function AppAnchor({
  href,
  className,
  title,
  rel,
  children,
  externalMark,
}: {
  href: string;
  className?: string;
  title?: string;
  rel?: string;
  children: ReactNode;
  externalMark?: ReactNode;
}) {
  const ownHost = useAppHost();
  const link = parseAppLink(href, ownHost);
  if (!link) {
    return (
      <ExternalAnchor href={href} className={className} title={title} rel={rel} externalMark={externalMark}>
        {children}
      </ExternalAnchor>
    );
  }
  if (link.dmChannelId) {
    return (
      <ResolvingAnchor link={{ ...link, dmChannelId: link.dmChannelId }} className={className} title={title}>
        {children}
      </ResolvingAnchor>
    );
  }
  return (
    <InAppAnchor link={link} className={className} title={title}>
      {children}
    </InAppAnchor>
  );
}
