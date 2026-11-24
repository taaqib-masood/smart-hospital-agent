import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadModule } from "./mock-module.ts";

const require = createRequire(import.meta.url);

function* nodes(node: React.ReactNode): Generator<React.ReactNode> {
  if (Array.isArray(node)) {
    for (const child of node) yield* nodes(child);
  } else {
    yield node;
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) yield* nodes(node.props.children);
  }
}

test("404 refresh clears the last live conversation and safely renders the empty inbox", async () => {
  const original = process.env.NEXT_PUBLIC_DEMO_MODE;
  try {
    for (const demo of [false, true]) {
      process.env.NEXT_PUBLIC_DEMO_MODE = String(demo);
      let conversations = [{ id: "conversation", contact_name: "Removed Patient", contact_phone: "+10000000000", last_message_at: "2030-01-01", unread_count: 1, is_bot_active: true }];
      const states: unknown[] = [];
      let cursor = 0;
      let effectCursor = 0;
      let reads = 0;
      let refreshes = 0;
      let effects: (() => void)[] = [];
      const dependencies: (readonly unknown[] | undefined)[] = [];
      const hooks = {
        ...React,
        useState(initial: unknown) {
          const index = cursor++;
          if (!(index in states)) states[index] = initial;
          return [states[index], (value: unknown) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
        },
        useEffect(effect: () => void, deps?: readonly unknown[]) {
          const index = effectCursor++;
          const previous = dependencies[index];
          if (!deps || !previous || deps.some((value, i) => !Object.is(value, previous[i]))) effects.push(effect);
          dependencies[index] = deps;
        },
        useRef: () => ({ current: null }),
      };
      const api = new Proxy({}, { get: (_target, name) => {
        if (name === "markConversationRead") return async (id: string) => {
          assert.equal(id, "conversation");
          reads++;
          throw new Error("404");
        };
        return name === "getAutomationRules" ? async () => ({ templates: [] }) : async () => [];
      } });
      const { default: Component } = loadModule("components/MessagesView.tsx", {
        react: { ...hooks, default: hooks },
        "react/jsx-runtime": require("react/jsx-runtime"),
        "framer-motion": { motion: new Proxy({}, { get: () => "div" }), AnimatePresence: "div" },
        "lucide-react": new Proxy({}, { get: () => "span" }),
        "@/lib/dashboard-context": { useDashboard: () => ({ clinic: null, conversations, refresh: () => { refreshes++; conversations = []; } }) },
        "@/lib/i18n/portal": { usePortalLanguage: () => ({ locale: "en", t: (value: string) => value }) },
        "@/lib/api": api,
        "@/lib/whatsapp-window": { getWhatsAppWindow: () => ({ isOpen: true }) },
      });
      const render = () => {
        cursor = 0;
        effectCursor = 0;
        effects = [];
        return (Component as unknown as (props: { addToast: () => void }) => React.ReactNode)({ addToast: () => {} });
      };
      const flush = () => { for (const effect of effects) effect(); };
      render();
      flush();
      assert.equal((states[0] as { _realId: string }[])[0]._realId, "conversation");
      const tree = render();
      flush();
      const contact = [...nodes(tree)].find(node => React.isValidElement<{ onClick?: () => void }>(node)
        && typeof node.props.onClick === "function" && [...nodes(node)].includes("Removed Patient"));
      assert.ok(React.isValidElement<{ onClick: () => void }>(contact));
      await contact.props.onClick();
      assert.equal(reads, 1);
      assert.equal(refreshes, 1);
      render();
      flush();
      const result = render();
      if (demo) assert.ok((states[0] as unknown[]).length > 0);
      else {
        assert.deepEqual(states[0], []);
        assert.equal(states[1], "");
        assert.deepEqual(states[2], {});
        assert.match(renderToStaticMarkup(result), /No conversations yet/);
      }
    }
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE; else process.env.NEXT_PUBLIC_DEMO_MODE = original;
  }
});
